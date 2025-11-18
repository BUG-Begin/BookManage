// 读者管理模块
const readers = {
    currentPage: 1,
    pageSize: 10,
    searchTerm: '',
    
    // 加载读者页面
    loadReadersPage: function() {
        app.showLoading('#pageContent');
        $.get('readers.html', function(data) {
            $('#pageContent').html(data);
            readers.loadReaders();
            readers.bindEvents();
        });
    },
    
    // 加载读者列表
    loadReaders: async function() {
        try {
            app.showLoading('#readersTableBody');
            
            const response = await api.readers.getAll({
                page: readers.currentPage,
                limit: readers.pageSize,
                search: readers.searchTerm
            });
            
            const readersData = response.data;
            const readersTableBody = $('#readersTableBody');
            readersTableBody.empty();
            
            if (readersData.length === 0) {
                readersTableBody.html('<tr><td colspan="9" class="text-center">没有找到读者记录</td></tr>');
                return;
            }
            
            readersData.forEach(reader => {
                const readerRow = `
                    <tr>
                        <td>${reader.id}</td>
                        <td>${reader.student_id}</td>
                        <td>${reader.name}</td>
                        <td>${reader.phone}</td>
                        <td>${reader.email || '-'}</td>
                        <td>${reader.address || '-'}</td>
                        <td>${reader.registration_date ? new Date(reader.registration_date).toLocaleDateString() : '-'}</td>
                        <td>
                            <button class="btn btn-warning btn-sm edit-reader" data-id="${reader.id}">
                                <i class="fa fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm delete-reader" data-id="${reader.id}">
                                <i class="fa fa-trash"></i>
                            </button>
                        </td>
                    </tr>
                `;
                readersTableBody.append(readerRow);
            });
            
            // 加载分页
            readers.loadPagination(response.pagination);
        } catch (error) {
            console.error('加载读者列表失败:', error);
            app.showAlert('加载读者列表失败，请重试', 'error');
        } finally {
            app.hideLoading('#readersTableBody');
        }
    },
    
    // 加载分页
    loadPagination: function(pagination) {
        const paginationContainer = $('#readersPagination');
        paginationContainer.empty();
        
        // 总页数
        const totalPages = Math.ceil(pagination.total / readers.pageSize);
        
        // 上一页按钮
        if (readers.currentPage > 1) {
            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${readers.currentPage - 1}">上一页</a>
                </li>
            `);
        }
        
        // 页码按钮
        for (let i = 1; i <= totalPages; i++) {
            if (i === readers.currentPage) {
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
        if (readers.currentPage < totalPages) {
            paginationContainer.append(`
                <li class="page-item">
                    <a class="page-link" href="#" data-page="${readers.currentPage + 1}">下一页</a>
                </li>
            `);
        }
    },
    
    // 绑定事件
    bindEvents: function() {
        // 搜索按钮事件
        $('#readerSearch').on('keyup', function(e) {
            if (e.key === 'Enter') {
                readers.searchTerm = $(this).val();
                readers.currentPage = 1;
                readers.loadReaders();
            }
        });
        
        // 添加读者按钮事件
        $('#addReaderBtn').on('click', function() {
            readers.showAddReaderModal();
        });
        
        // 编辑读者按钮事件
        $(document).on('click', '.edit-reader', function() {
            const readerId = $(this).data('id');
            readers.showEditReaderModal(readerId);
        });
        
        // 删除读者按钮事件
        $(document).on('click', '.delete-reader', function() {
            const readerId = $(this).data('id');
            readers.deleteReader(readerId);
        });
        
        // 分页按钮事件
        $(document).on('click', '#readersPagination a', function(e) {
            e.preventDefault();
            readers.currentPage = parseInt($(this).data('page'));
            readers.loadReaders();
        });
        
        // 读者表单提交事件
        $('#readerForm').on('submit', function(e) {
            e.preventDefault();
            readers.saveReader();
        });
    },
    
    // 显示添加读者模态框
    showAddReaderModal: function() {
        $('#readerModalTitle').text('添加读者');
        $('#readerForm')[0].reset();
        $('#readerModal').addClass('show');
        readers.currentReaderId = null;
    },
    
    // 显示编辑读者模态框
    showEditReaderModal: async function(readerId) {
        try {
            const response = await api.readers.getById(readerId);
            const reader = response.data;
            
            $('#readerModalTitle').text('编辑读者');
            $('#readerStudentId').val(reader.student_id);
            $('#readerName').val(reader.name);
            $('#readerPhone').val(reader.phone);
            $('#readerEmail').val(reader.email);
            $('#readerAddress').val(reader.address);
            if (reader.registration_date) {
                $('#readerRegistrationDate').val(new Date(reader.registration_date).toISOString().split('T')[0]);
            } else {
                $('#readerRegistrationDate').val('');
            }
            
            $('#readerModal').addClass('show');
            readers.currentReaderId = readerId;
        } catch (error) {
            console.error('获取读者详情失败:', error);
            app.showAlert('获取读者详情失败，请重试', 'error');
        }
    },
    
    // 保存读者
    saveReader: async function() {
        const readerData = {
            student_id: $('#readerStudentId').val(),
            name: $('#readerName').val(),
            phone: $('#readerPhone').val(),
            email: $('#readerEmail').val(),
            address: $('#readerAddress').val(),
            registration_date: $('#readerRegistrationDate').val() || null
        };
        
        try {
            if (readers.currentReaderId) {
                // 更新读者
                await api.readers.update(readers.currentReaderId, readerData);
                app.showAlert('读者更新成功', 'success');
            } else {
                // 添加读者
                await api.readers.create(readerData);
                app.showAlert('读者添加成功', 'success');
            }
            
            // 关闭模态框
            $('#readerModal').removeClass('show');
            
            // 重新加载读者列表
            readers.loadReaders();
        } catch (error) {
            console.error('保存读者失败:', error);
            app.showAlert('保存读者失败，请重试', 'error');
        }
    },
    
    // 删除读者
    deleteReader: async function(readerId) {
        if (confirm('确定要删除这个读者吗？')) {
            try {
                await api.readers.delete(readerId);
                app.showAlert('读者删除成功', 'success');
                readers.loadReaders();
            } catch (error) {
                console.error('删除读者失败:', error);
                app.showAlert('删除读者失败，请重试', 'error');
            }
        }
    }
};

// 关闭模态框事件
$(document).on('click', '.close-btn, [data-bs-dismiss="modal"]', function() {
    $('#readerModal').removeClass('show');
});

// 点击模态框外部关闭模态框
$(window).on('click', function(e) {
    if (e.target.id === 'readerModal') {
        $('#readerModal').removeClass('show');
    }
});