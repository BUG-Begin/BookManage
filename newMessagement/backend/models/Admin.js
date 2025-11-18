// 管理员模型
const { getPool } = require('../config/database');

class Admin {
    constructor(id, username, email, password, created_at, updated_at) {
        this.id = id;
        this.username = username;
        this.email = email;
        this.password = password;
        this.created_at = created_at;
        this.updated_at = updated_at;
    }

    // 查找所有管理员
    static async findAll() {
        const pool = await getPool();
        const result = await pool.request()
            .query('SELECT * FROM Admins ORDER BY id');
        return result.recordset.map(admin => new Admin(
            admin.id,
            admin.username,
            admin.email,
            admin.password,
            admin.created_at,
            admin.updated_at
        ));
    }

    // 根据ID查找管理员
    static async findById(id) {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', id)
            .query('SELECT * FROM Admins WHERE id = @id');
        return result.recordset.length > 0 ? new Admin(
            result.recordset[0].id,
            result.recordset[0].username,
            result.recordset[0].email,
            result.recordset[0].password,
            result.recordset[0].created_at,
            result.recordset[0].updated_at
        ) : null;
    }

    // 根据用户名查找管理员
    static async findByUsername(username) {
        const pool = await getPool();
        const result = await pool.request()
            .input('username', username)
            .query('SELECT * FROM Admins WHERE username = @username');
        return result.recordset.length > 0 ? new Admin(
            result.recordset[0].id,
            result.recordset[0].username,
            result.recordset[0].email,
            result.recordset[0].password,
            result.recordset[0].created_at,
            result.recordset[0].updated_at
        ) : null;
    }

    // 创建管理员
    static async create(adminData) {
        const { username, email, password } = adminData;
        const pool = await getPool();
        
        // 插入管理员数据
        await pool.request()
            .input('username', username)
            .input('email', email)
            .input('password', password)
            .query(`
                INSERT INTO Admins (username, email, password, created_at, updated_at)
                VALUES (@username, @email, @password, GETDATE(), GETDATE())
            `);
        
        // 查询刚创建的管理员
        const createdAdmin = await this.findByUsername(username);
        return createdAdmin;
    }

    // 更新管理员
    static async update(id, adminData) {
        const { username, email } = adminData;
        const pool = await getPool();
        const result = await pool.request()
            .input('id', id)
            .input('username', username)
            .input('email', email)
            .query(`
                UPDATE Admins
                SET username = @username, email = @email, updated_at = GETDATE()
                WHERE id = @id
                OUTPUT INSERTED.*
            `);
        
        return result.recordset.length > 0 ? new Admin(
            result.recordset[0].id,
            result.recordset[0].username,
            result.recordset[0].email,
            result.recordset[0].password,
            result.recordset[0].created_at,
            result.recordset[0].updated_at
        ) : null;
    }

    // 删除管理员
    static async delete(id) {
        const pool = await getPool();
        const result = await pool.request()
            .input('id', id)
            .query('DELETE FROM Admins WHERE id = @id');
        return result.rowsAffected[0] > 0;
    }

    // 更新密码
    static async updatePassword(id, password) {
        const pool = await getPool();
        
        // 先更新密码
        await pool.request()
            .input('id', id)
            .input('password', password)
            .query(`
                UPDATE Admins
                SET password = @password, updated_at = GETDATE()
                WHERE id = @id
            `);
        
        // 再查询更新后的管理员信息
        return await this.findById(id);
    }
}

module.exports = Admin;