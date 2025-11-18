// 数据库初始化脚本
const { getPool, sql } = require('../config/database');

async function initDatabase() {
    try {
        const pool = await getPool();
        console.log('🔗 数据库连接成功，开始初始化表结构...');

        // 创建Admins表
        await pool.request().query(`
            IF OBJECT_ID('Admins', 'U') IS NULL
            BEGIN
                CREATE TABLE Admins (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    username NVARCHAR(50) NOT NULL UNIQUE,
                    email NVARCHAR(100) NOT NULL UNIQUE,
                    password NVARCHAR(255) NOT NULL,
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE()
                );
            END
        `);
        console.log('✅ Admins表创建成功');

        // 创建Categories表
        await pool.request().query(`
            IF OBJECT_ID('Categories', 'U') IS NULL
            BEGIN
                CREATE TABLE Categories (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(50) NOT NULL UNIQUE,
                    description NVARCHAR(255),
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE()
                );
            END
        `);
        console.log('✅ Categories表创建成功');

        // 创建Publishers表
        await pool.request().query(`
            IF OBJECT_ID('Publishers', 'U') IS NULL
            BEGIN
                CREATE TABLE Publishers (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(100) NOT NULL UNIQUE,
                    address NVARCHAR(255),
                    phone NVARCHAR(20),
                    email NVARCHAR(100),
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE()
                );
            END
        `);
        console.log('✅ Publishers表创建成功');

        // 创建Books表
        await pool.request().query(`
            IF OBJECT_ID('Books', 'U') IS NULL
            BEGIN
                CREATE TABLE Books (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    title NVARCHAR(255) NOT NULL,
                    author NVARCHAR(100) NOT NULL,
                    isbn NVARCHAR(20) NOT NULL UNIQUE,
                    category_id INT,
                    publisher_id INT,
                    publication_year INT,
                    price DECIMAL(10, 2),
                    quantity INT DEFAULT 0,
                    available_quantity INT DEFAULT 0,
                    description NVARCHAR(MAX),
                    cover_image NVARCHAR(255),
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (category_id) REFERENCES Categories(id),
                    FOREIGN KEY (publisher_id) REFERENCES Publishers(id)
                );
            END
        `);
        console.log('✅ Books表创建成功');

        // 创建Readers表
        await pool.request().query(`
            IF OBJECT_ID('Readers', 'U') IS NULL
            BEGIN
                CREATE TABLE Readers (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    name NVARCHAR(100) NOT NULL,
                    student_id NVARCHAR(20) NOT NULL UNIQUE,
                    email NVARCHAR(100) NOT NULL UNIQUE,
                    phone NVARCHAR(20),
                    department NVARCHAR(100),
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE()
                );
            END
        `);
        console.log('✅ Readers表创建成功');

        // 创建Borrows表
        await pool.request().query(`
            IF OBJECT_ID('Borrows', 'U') IS NULL
            BEGIN
                CREATE TABLE Borrows (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    book_id INT NOT NULL,
                    reader_id INT NOT NULL,
                    borrow_date DATETIME DEFAULT GETDATE(),
                    due_date DATETIME,
                    return_date DATETIME,
                    status NVARCHAR(20) DEFAULT 'borrowed',
                    created_at DATETIME DEFAULT GETDATE(),
                    updated_at DATETIME DEFAULT GETDATE(),
                    FOREIGN KEY (book_id) REFERENCES Books(id),
                    FOREIGN KEY (reader_id) REFERENCES Readers(id)
                );
            END
        `);
        console.log('✅ Borrows表创建成功');

        console.log('🎉 数据库初始化完成！所有表结构已创建。');
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        throw error;
    }
}

// 执行初始化脚本
initDatabase();