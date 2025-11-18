// 借阅管理模块
const borrows = {
    currentPage: 1,
    pageSize: 10,
    searchTerm: '',
    statusFilter: '',
    
    // 加载借阅页面
    loadBorrowsPage: function() {
        app.showLoading('#pageContent');
        $.get('borrows.html', function(data) {
            $('#pageContent').html(data);
            borrows.loadBorrows();
            borrows.loadReaders();
            borrows.loadBooks();
            borrows.bindEvents();
        });
    },
    
    // 加载借阅记录列表
    loadBorrows: async function() {
        try {
            app.showLoading('#borrowsTableBody');
            
            const status = $('#borrowStatusFilter').val();
            const response = await api.borrows.getAll({
                page: borrows.currentPage,
                limit: borrows.pageSize,
                search: borrows.searchTerm,
                status: status || undefined
            });
            
            const borrowsData = response.data;
            const borrowsTableBody = $('#borrowsTableBody');
            borrowsTableBody.empty();
            
            if (borrowsData.length === 0) {
                borrowsTableBody.html('<tr><td colspan="10" class="text-center">没有找到借阅记录</td></tr>');
                return;
            }
            
            borrowsData.forEach(borrow => {
                // 确定状态显示
                let statusText = '';
                let statusClass = '';
                if (borrow.status === 'active') {
                    statusText = '已借出';
                    statusClass = 'text-warning';
                } else if (borrow.status === 'returned') {
                    statusText = '已归还';
                    statusClass = 'text-success';
                } else if (borrow.status === 'overdue') {
                    statusText = '逾期';
                    statusClass = 'text-danger';
                }
                
                const borrowRow = `
                    <tr>
                        <td>${borrow.id}</td>
                        <td>${borrow.reader_name}</td>
                        <td>${borrow.student_id}</td>
                        <td>${borrow.book_title}</td>
                        <td>${borrow.isbn}</td>
                        <td>${new Date(borrow.borrow_date).toLocaleDateString()}</td>
                        <td>${new Date(borrow.due_date).toLocaleDateString()}</td>
                        <td>${borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : '-'}</td>
                        <td><span class="${statusClass}">${statusText}</span></td>
                        <td>
                            ${borrow.status === 'active' ? `
                                <button class="btn btn-success btn-sm return-book" data-id="${borrow.id}">
                                    <i class="fa fa-undo"></i> 归还
                                </button>
                                <button class="btn btn-warning btn-sm renew-book" data-id="${borrow.id}">
                                    <i class="fa fa-repeat"></i> 续借
                                </button>
                            ` : ''}
                        </td>
                    </tr>
                `;
                borrowsTableBody.append(borrowRow);
            });
            
            // 加载分页
            borrows.loadPagination(response.pagination);
        } catch (error) {
            console.error('加载借阅记录失败:', error);
            app.showAlert('加载借阅记录失败，请重试', 'error');
        } finally {
            app.hideLoading('#borrowsTableBody');
        }
    },
    
    // 加载读者列表
    loadReaders: async function() {
        try {
            const response = await api.readers.getAll();
            const readers = response.data;
            const readerSelect = $('#borrowReader');
            readerSelect.empty();
            
            readers.forEach(reader => {
                readerSelect.append(`<option value="${reader.id}">${reader.name} (${reader.student_id})</option>`);
            });
        } catch (error) {
            console.error('加载读者列表失败:', error);
        }
    },
    
    // 加载图书列表
    loadBooks: async function() {
        try {
            const response = await api.books.getAll();
            const books = response.data;
            const bookSelect = $('#borrowBook');
            bookSelect.empty();
            
            books.forEach(book => {
                bookSelect.append(`<option value="${book.id}">${book.title} (剩余: ${book.available_copies})</option>`);
            });
        } catch (error) {
            console.error('加载图书列表失败:', error);
        }
    },
    
    // 加载分页
    loadPagination: function(pagination) {
        const paginationContainer = $('#borrowsPagination');
        paginationContainer.empty();
        
        // 总页数
        const totalPages = Math.ceil(pagination.total / borrows.pageSize);
        
        // 上一页按钮
        if (borrows.currentPage > 1) {
            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${borrows.currentPage - 1}">上一页</a>
                </li>
            `);
        }
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === borrows.currentPage) {
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
        if (borrows.currentPage < totalPages) {
            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${borrows.currentPage + 1}">下一页</a>
                </li>
            `);
        }
    },
    
    // 绑定事件
    bindEvents: function() {
        // 搜索按钮事件
        $('#borrowSearch').on('keyup', function(e) {
            if (e.key === 'Enter') {
                borrows.searchTerm = $(this).val();
                borrows.currentPage = 1;
                borrows.loadBorrows();
            }
        });
        
        // 状态过滤事件
        $('#borrowStatus').on('change', function() {
            borrows.statusFilter = $(this).val();
            borrows.currentPage = 1;
            borrows.loadBorrows();
        });
        
        // 添加借阅按钮事件
        $('#addBorrowBtn').on('click', function() {
            borrows.showAddBorrowModal();
        });
        
        // 归还图书按钮事件
        $(document).on('click', '.return-book', function() {
            const borrowId = $(this).data('id');
            borrows.returnBook(borrowId);
        });
        
        // 续借图书按钮事件
        $(document).on('click', '.renew-book', function() {
            const borrowId = $(this).data('id');
            borrows.renewBook(borrowId);
        });
        
        // 分页按钮事件
        $(document).on('click', '#borrowsPagination a', function(e) {
            e.preventDefault();
            borrows.currentPage = parseInt($(this).data('page'));
            borrows.loadBorrows();
        });
        
        // 借阅表单提交事件
        $('#borrowForm').on('submit', function(e) {
            e.preventDefault();
            borrows.saveBorrow();
        });
    },
    
    // 显示添加借阅模态框
    showAddBorrowModal: function() {
        $('#borrowModalTitle').text('添加借阅记录');
        $('#borrowForm')[0].reset();
        
        // 设置默认日期
        const today = new Date();
        const dueDate = new Date();
        dueDate.setDate(today.getDate() + 30); // 默认借阅30天
        
        $('#borrowDate').val(today.toISOString().split('T')[0]);
        $('#dueDate').val(dueDate.toISOString().split('T')[0]);
        
        $('#borrowModal').addClass('show');
    },
    
    // 保存借阅记录
    saveBorrow: async function() {
        const readerId = $('#borrowReader').val();
        const bookId = $('#borrowBook').val();
        
        if (!readerId || !bookId) {
            app.showAlert('请选择读者和图书', 'error');
            return;
        }
        
        try {
            await api.borrows.create({
                reader_id: readerId,
                book_id: bookId
            });
            
            app.showAlert('借阅成功', 'success');
            $('#borrowModal').removeClass('show');
            borrows.loadBorrows();
        } catch (error) {
            console.error('借阅失败:', error);
            app.showAlert('借阅失败，请重试', 'error');
        }
    },
    
    // 归还图书
    returnBook: async function(borrowId) {
        if (confirm('确定要归还这本图书吗？')) {
            try {
                await api.borrows.return(borrowId, {
                    return_date: new Date().toISOString().split('T')[0]
                });
                app.showAlert('图书归还成功', 'success');
                borrows.loadBorrows();
            } catch (error) {
                console.error('归还图书失败:', error);
                app.showAlert('归还图书失败，请重试', 'error');
            }
        }
    },
    
    // 续借图书
    renewBook: async function(borrowId) {
        if (confirm('确定要续借这本图书吗？')) {
            try {
                await api.borrows.renew(borrowId, {
                    days: 30 // 默认续借30天
                });
                app.showAlert('图书续借成功', 'success');
                borrows.loadBorrows();
            } catch (error) {
                console.error('续借图书失败:', error);
                app.showAlert('续借图书失败，请重试', 'error');
            }
        }
    }
};

// 关闭模态框事件
$(document).on('click', '.close-btn, [data-bs-dismiss="modal"]', function() {
    $('#borrowModal').removeClass('show');
});

// 点击模态框外部关闭模态框
$(window).on('click', function(e) {
    if (e.target.id === 'borrowModal') {
        $('#borrowModal').removeClass('show');
    }
});