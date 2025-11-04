-- 创建图书管理数据库
CREATE DATABASE LibraryManagement;
GO

USE LibraryManagement;
GO

-- 1. 管理员表 (adminer)
CREATE TABLE adminer (
    admin_id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(50) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('超级管理员', '普通管理员')),
    last_login DATETIME2 NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 2. 读者表 (reader)
CREATE TABLE reader (
    reader_id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    gender VARCHAR(10) NULL CHECK (gender IN ('男', '女')),
    phone VARCHAR(20) NULL UNIQUE,
    email VARCHAR(100) NULL UNIQUE,
    address VARCHAR(200) NULL,
    reader_type VARCHAR(10) NOT NULL CHECK (reader_type IN ('学生', '教师', '职工')),
    max_borrow INT NOT NULL DEFAULT 5,
    registration_date DATE NOT NULL,
    valid_until DATE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE()
);
GO

-- 3. 出版社表 (publisher)
CREATE TABLE publisher (
    publisher_id INT IDENTITY(1,1) PRIMARY KEY,
    publisher_name VARCHAR(100) NOT NULL UNIQUE,
    contact_person VARCHAR(50) NULL,
    phone VARCHAR(20) NULL,
    address VARCHAR(200) NULL
);
GO

-- 4. 图书分类表 (category)
CREATE TABLE category (
    category_id INT IDENTITY(1,1) PRIMARY KEY,
    category_name VARCHAR(50) NOT NULL UNIQUE,
    parent_id INT NULL,
    FOREIGN KEY (parent_id) REFERENCES category(category_id)
);
GO

-- 5. 图书表 (book)
CREATE TABLE book (
    book_id INT IDENTITY(1,1) PRIMARY KEY,
    isbn VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(100) NOT NULL,
    publisher_id INT NOT NULL,
    category_id INT NOT NULL,
    publish_date DATE NULL,
    price DECIMAL(10,2) NULL,
    cover_image VARCHAR(255) NULL,
    summary TEXT NULL,
    total_copies INT NOT NULL DEFAULT 1,
    available_copies INT NOT NULL DEFAULT 1,
    location VARCHAR(50) NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (publisher_id) REFERENCES publisher(publisher_id),
    FOREIGN KEY (category_id) REFERENCES category(category_id)
);
GO

-- 6. 借阅记录表 (borrow)
CREATE TABLE borrow (
    borrow_id BIGINT IDENTITY(1,1) PRIMARY KEY,
    book_id INT NOT NULL,
    reader_id INT NOT NULL,
    borrow_date DATE NOT NULL DEFAULT CAST(GETDATE() AS DATE),
    due_date DATE NOT NULL,
    return_date DATE NULL,
    renew_count INT NOT NULL DEFAULT 0,
    operator_id INT NOT NULL,
    status VARCHAR(10) NOT NULL DEFAULT '在借' CHECK (status IN ('在借', '已还', '逾期')),
    FOREIGN KEY (book_id) REFERENCES book(book_id),
    FOREIGN KEY (reader_id) REFERENCES reader(reader_id),
    FOREIGN KEY (operator_id) REFERENCES adminer(admin_id)
);
GO

-- 创建索引以提高查询性能
CREATE INDEX IX_reader_phone ON reader(phone);
CREATE INDEX IX_reader_email ON reader(email);
CREATE INDEX IX_book_isbn ON book(isbn);
CREATE INDEX IX_book_title ON book(title);
CREATE INDEX IX_borrow_due_date ON borrow(due_date);
CREATE INDEX IX_borrow_status ON borrow(status);
CREATE INDEX IX_borrow_reader_book ON borrow(reader_id, book_id);
GO

-- 插入初始管理员数据
INSERT INTO adminer (username, password_hash, name, role) 
VALUES 
('admin', 'hashed_password_here', '系统管理员', '超级管理员'),
('manager1', 'hashed_password_here', '张管理', '普通管理员');
GO

-- 插入初始读者类型规则（可选：可以创建单独的配置表）
-- 这里我们直接在读者表中通过max_borrow和valid_until字段管理

-- 创建视图：当前在借图书视图
CREATE VIEW v_current_borrows AS
SELECT 
    b.borrow_id,
    r.reader_id,
    r.name AS reader_name,
    bk.book_id,
    bk.title AS book_title,
    bk.isbn,
    b.borrow_date,
    b.due_date,
    b.renew_count,
    b.status
FROM borrow b
INNER JOIN reader r ON b.reader_id = r.reader_id
INNER JOIN book bk ON b.book_id = bk.book_id
WHERE b.status IN ('在借', '逾期');
GO

-- 创建视图：图书详细信息视图
CREATE VIEW v_book_details AS
SELECT 
    b.book_id,
    b.isbn,
    b.title,
    b.author,
    p.publisher_name,
    c.category_name,
    b.publish_date,
    b.price,
    b.total_copies,
    b.available_copies,
    b.location,
    b.created_at
FROM book b
INNER JOIN publisher p ON b.publisher_id = p.publisher_id
INNER JOIN category c ON b.category_id = c.category_id;
GO

-- 创建存储过程：借书操作
CREATE PROCEDURE sp_borrow_book
    @book_id INT,
    @reader_id INT,
    @operator_id INT,
    @borrow_days INT = 30, -- 默认借阅30天
    @result_code INT OUTPUT,
    @result_msg NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 检查读者是否存在且有效
        IF NOT EXISTS (SELECT 1 FROM reader WHERE reader_id = @reader_id AND valid_until >= CAST(GETDATE() AS DATE))
        BEGIN
            SET @result_code = -1;
            SET @result_msg = '读者不存在或账户已过期';
            ROLLBACK;
            RETURN;
        END
        
        -- 检查图书是否存在且可借
        IF NOT EXISTS (SELECT 1 FROM book WHERE book_id = @book_id AND available_copies > 0)
        BEGIN
            SET @result_code = -2;
            SET @result_msg = '图书不存在或已全部借出';
            ROLLBACK;
            RETURN;
        END
        
        -- 检查读者是否超过最大借书数量
        DECLARE @current_borrows INT;
        SELECT @current_borrows = COUNT(*) 
        FROM borrow 
        WHERE reader_id = @reader_id AND status IN ('在借', '逾期');
        
        DECLARE @max_borrow INT;
        SELECT @max_borrow = max_borrow FROM reader WHERE reader_id = @reader_id;
        
        IF @current_borrows >= @max_borrow
        BEGIN
            SET @result_code = -3;
            SET @result_msg = '读者已达到最大借书数量限制';
            ROLLBACK;
            RETURN;
        END
        
        -- 执行借书操作
        INSERT INTO borrow (book_id, reader_id, due_date, operator_id)
        VALUES (@book_id, @reader_id, DATEADD(DAY, @borrow_days, GETDATE()), @operator_id);
        
        -- 更新图书可借数量
        UPDATE book 
        SET available_copies = available_copies - 1 
        WHERE book_id = @book_id;
        
        SET @result_code = 0;
        SET @result_msg = '借书成功';
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @result_code = -99;
        SET @result_msg = '借书操作失败: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- 创建存储过程：还书操作
CREATE PROCEDURE sp_return_book
    @borrow_id BIGINT,
    @operator_id INT,
    @result_code INT OUTPUT,
    @result_msg NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 检查借阅记录是否存在且未归还
        IF NOT EXISTS (SELECT 1 FROM borrow WHERE borrow_id = @borrow_id AND return_date IS NULL)
        BEGIN
            SET @result_code = -1;
            SET @result_msg = '借阅记录不存在或已归还';
            ROLLBACK;
            RETURN;
        END
        
        -- 获取图书ID
        DECLARE @book_id INT;
        SELECT @book_id = book_id FROM borrow WHERE borrow_id = @borrow_id;
        
        -- 执行还书操作
        UPDATE borrow 
        SET return_date = GETDATE(),
            status = '已还',
            operator_id = @operator_id
        WHERE borrow_id = @borrow_id;
        
        -- 更新图书可借数量
        UPDATE book 
        SET available_copies = available_copies + 1 
        WHERE book_id = @book_id;
        
        SET @result_code = 0;
        SET @result_msg = '还书成功';
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @result_code = -99;
        SET @result_msg = '还书操作失败: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- 创建存储过程：续借操作
CREATE PROCEDURE sp_renew_book
    @borrow_id BIGINT,
    @renew_days INT = 30,
    @operator_id INT,
    @result_code INT OUTPUT,
    @result_msg NVARCHAR(200) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    
    BEGIN TRY
        BEGIN TRANSACTION;
        
        -- 检查借阅记录是否存在且未归还
        IF NOT EXISTS (SELECT 1 FROM borrow WHERE borrow_id = @borrow_id AND return_date IS NULL)
        BEGIN
            SET @result_code = -1;
            SET @result_msg = '借阅记录不存在或已归还';
            ROLLBACK;
            RETURN;
        END
        
        -- 检查续借次数（假设最多续借2次）
        DECLARE @current_renew_count INT;
        SELECT @current_renew_count = renew_count FROM borrow WHERE borrow_id = @borrow_id;
        
        IF @current_renew_count >= 2
        BEGIN
            SET @result_code = -2;
            SET @result_msg = '已达到最大续借次数';
            ROLLBACK;
            RETURN;
        END
        
        -- 执行续借操作
        UPDATE borrow 
        SET due_date = DATEADD(DAY, @renew_days, due_date),
            renew_count = renew_count + 1,
            operator_id = @operator_id
        WHERE borrow_id = @borrow_id;
        
        SET @result_code = 0;
        SET @result_msg = '续借成功';
        
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @result_code = -99;
        SET @result_msg = '续借操作失败: ' + ERROR_MESSAGE();
    END CATCH
END;
GO

-- 创建每日任务：更新逾期状态
CREATE PROCEDURE sp_update_overdue_status
AS
BEGIN
    UPDATE borrow 
    SET status = '逾期'
    WHERE status = '在借' 
    AND due_date < CAST(GETDATE() AS DATE)
    AND return_date IS NULL;
END;
GO

-- 创建触发器：自动更新图书可借数量（防止直接修改borrow表导致数据不一致）
CREATE TRIGGER tr_borrow_update_book_copies
ON borrow
AFTER INSERT, UPDATE
AS
BEGIN
    SET NOCOUNT ON;
    
    -- 处理新插入的借阅记录（借书）
    IF EXISTS (SELECT 1 FROM inserted WHERE return_date IS NULL)
    BEGIN
        UPDATE b
        SET available_copies = available_copies - 1
        FROM book b
        INNER JOIN inserted i ON b.book_id = i.book_id
        WHERE i.return_date IS NULL;
    END
    
    -- 处理更新的归还记录（还书）
    IF EXISTS (SELECT 1 FROM inserted i INNER JOIN deleted d ON i.borrow_id = d.borrow_id WHERE i.return_date IS NOT NULL AND d.return_date IS NULL)
    BEGIN
        UPDATE b
        SET available_copies = available_copies + 1
        FROM book b
        INNER JOIN inserted i ON b.book_id = i.book_id
        INNER JOIN deleted d ON i.borrow_id = d.borrow_id
        WHERE i.return_date IS NOT NULL AND d.return_date IS NULL;
    END
END;
GO

PRINT '图书管理数据库创建完成！';
PRINT '包含以下对象：';
PRINT '- 6个数据表：adminer, reader, publisher, category, book, borrow';
PRINT '- 2个视图：v_current_borrows, v_book_details';
PRINT '- 4个存储过程：sp_borrow_book, sp_return_book, sp_renew_book, sp_update_overdue_status';
PRINT '- 1个触发器：tr_borrow_update_book_copies';