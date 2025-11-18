// 图书管理模块
const books = {
    currentPage: 1,
    pageSize: 10,
    searchTerm: '',
    
    // 加载图书页面
    loadBooksPage: function() {
        app.showLoading('#pageContent');
        $.get('books.html', function(data) {
            $('#pageContent').html(data);
            books.loadBooks();
            books.loadCategories();
            books.loadPublishers();
            books.bindEvents();
        });
    },
    
    // 加载图书列表
    loadBooks: async function() {
        try {
            app.showLoading('#booksTableBody');
            
            const response = await api.books.getAll({
                page: books.currentPage,
                limit: books.pageSize,
                search: books.searchTerm
            });
            
            const booksData = response.data;
            const booksTableBody = $('#booksTableBody');
            booksTableBody.empty();
            
            if (booksData.length === 0) {
                booksTableBody.html('<tr><td colspan="9" class="text-center">没有找到图书记录</td></tr>');
                return;
            }
            
            booksData.forEach(book => {
                const bookRow = `
                    <tr>
                        <td>${book.id}</td>
                        <td>${book.isbn}</td>
                        <td>${book.title}</td>
                        <td>${book.author}</td>
                        <td>${book.category_name || '未分类'}</td>
                        <td>${book.publisher_name || '未知出版商'}</td>
                        <td>${book.total_copies}</td>
                        <td>${book.available_copies}</td>
                        <td>${book.publish_date ? new Date(book.publish_date).toLocaleDateString() : '-'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-book" data-id="${book.id}">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-book" data-id="${book.id}">
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                booksTableBody.append(bookRow);
            });
            
            // 加载分页
            books.loadPagination(response.pagination);
        } catch (error) {
            console.error('加载图书列表失败:', error);
            app.showAlert('加载图书列表失败，请重试', 'error');
        } finally {
            app.hideLoading('#booksTableBody');
        }
    },
    
    // 加载分类列表
    loadCategories: async function() {
        try {
            const response = await api.categories.getAll();
            const categories = response.data;
            const categorySelect = $('#bookCategory');
            categorySelect.empty();
            
            categories.forEach(category => {
                categorySelect.append(`<option value="${category.id}">${category.name}</option>`);
            });
        } catch (error) {
            console.error('加载分类列表失败:', error);
        }
    },
    
    // 加载出版商列表
    loadPublishers: async function() {
        try {
            const response = await api.publishers.getAll();
            const publishers = response.data;
            const publisherSelect = $('#bookPublisher');
            publisherSelect.empty();
            
            publishers.forEach(publisher => {
                publisherSelect.append(`<option value="${publisher.id}">${publisher.name}</option>`);
            });
        } catch (error) {
            console.error('加载出版商列表失败:', error);
        }
    },
    
    // 加载分页
    loadPagination: function(pagination) {
        const paginationContainer = $('#booksPagination');
        paginationContainer.empty();
        
        // 总页数
        const totalPages = Math.ceil(pagination.total / books.pageSize);
        
        // 上一页按钮
        if (books.currentPage > 1) {
            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${books.currentPage - 1}">上一页</a>
                </li>
            `);
        }
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === books.currentPage) {
                paginationContainer.append(`
                    <li class="page-item active">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `);
            } else {
                paginationContainer.append(`
                    <li class="page-item">
                        <a class="page-link" href="#" data-page="${i}">${i}</a>
                    </li>
                `);
            }
        }
        
        // 下一页按钮
        if (books.currentPage < totalPages) {
            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${books.currentPage + 1}">下一页</a>
                </li>
            `);
        }
    },
    
    // 绑定事件
    bindEvents: function() {
        // 搜索按钮事件
        $('#bookSearch').on('keyup', function(e) {
            if (e.key === 'Enter') {
                books.searchTerm = $(this).val();
                books.currentPage = 1;
                books.loadBooks();
            }
        });
        
        // 添加图书按钮事件
        $('#addBookBtn').on('click', function() {
            books.showAddBookModal();
        });
        
        // 编辑图书按钮事件
        $(document).on('click', '.edit-book', function() {
            const bookId = $(this).data('id');
            books.showEditBookModal(bookId);
        });
        
        // 删除图书按钮事件
        $(document).on('click', '.delete-book', function() {
            const bookId = $(this).data('id');
            books.deleteBook(bookId);
        });
        
        // 分页按钮事件
        $(document).on('click', '#booksPagination a', function(e) {
            e.preventDefault();
            books.currentPage = parseInt($(this).data('page'));
            books.loadBooks();
        });
        
        // 图书表单提交事件
        $('#bookForm').on('submit', function(e) {
            e.preventDefault();
            books.saveBook();
        });
    },
    
    // 显示添加图书模态框
    showAddBookModal: function() {
        $('#bookModalTitle').text('添加图书');
        $('#bookForm')[0].reset();
        $('#bookModal').addClass('show');
        books.currentBookId = null;
    },
    
    // 显示编辑图书模态框
    showEditBookModal: async function(bookId) {
        try {
            const response = await api.books.getById(bookId);
            const book = response.data;
            
            $('#bookModalTitle').text('编辑图书');
            $('#bookISBN').val(book.isbn);
            $('#bookTitle').val(book.title);
            $('#bookAuthor').val(book.author);
            $('#bookCategory').val(book.category_id);
            $('#bookPublisher').val(book.publisher_id);
            $('#bookTotalCopies').val(book.total_copies);
            $('#bookAvailableCopies').val(book.available_copies);
            $('#bookDescription').val(book.description);
            if (book.publish_date) {
                $('#bookPublishDate').val(new Date(book.publish_date).toISOString().split('T')[0]);
            } else {
                $('#bookPublishDate').val('');
            }
            
            $('#bookModal').addClass('show');
            books.currentBookId = bookId;
        } catch (error) {
            console.error('获取图书详情失败:', error);
            app.showAlert('获取图书详情失败，请重试', 'error');
        }
    },
    
    // 保存图书
    saveBook: async function() {
        const bookData = {
            isbn: $('#bookISBN').val(),
            title: $('#bookTitle').val(),
            author: $('#bookAuthor').val(),
            category_id: $('#bookCategory').val(),
            publisher_id: $('#bookPublisher').val(),
            total_copies: parseInt($('#bookTotalCopies').val()),
            available_copies: parseInt($('#bookAvailableCopies').val()),
            description: $('#bookDescription').val(),
            publish_date: $('#bookPublishDate').val() || null
        };
        
        try {
            if (books.currentBookId) {
                // 更新图书
                await api.books.update(books.currentBookId, bookData);
                app.showAlert('图书更新成功', 'success');
            } else {
                // 添加图书
                await api.books.create(bookData);
                app.showAlert('图书添加成功', 'success');
            }
            
            // 关闭模态框
            $('#bookModal').removeClass('show');
            
            // 重新加载图书列表
            books.loadBooks();
        } catch (error) {
            console.error('保存图书失败:', error);
            app.showAlert('保存图书失败，请重试', 'error');
        }
    },
    
    // 删除图书
    deleteBook: async function(bookId) {
        if (confirm('确定要删除这本图书吗？')) {
            try {
                await api.books.delete(bookId);
                app.showAlert('图书删除成功', 'success');
                books.loadBooks();
            } catch (error) {
                console.error('删除图书失败:', error);
                app.showAlert('删除图书失败，请重试', 'error');
            }
        }
    }
};

// 关闭模态框事件
$(document).on('click', '.close-btn, [data-bs-dismiss="modal"]', function() {
    $('#bookModal').removeClass('show');
});

// 点击模态框外部关闭模态框
$(window).on('click', function(e) {
    if (e.target.id === 'bookModal') {
        $('#bookModal').removeClass('show');
    }
});