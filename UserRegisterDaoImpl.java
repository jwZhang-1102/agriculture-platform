package com.backend.ap.dao_jw.impl;

import com.backend.ap.dao_jw.UserRegisterDao;
import java.sql.PreparedStatement;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import com.backend.ap.pojo_jw.UserInfo;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;
import javax.sql.DataSource;

@Repository
public class UserRegisterDaoImpl implements UserRegisterDao {
    private final DataSource dataSource;

    @Autowired
    public UserRegisterDaoImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public void registerUser(String username, String password, String email, String phone) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());

            conn = dataSource.getConnection();

            String sql = "INSERT INTO users(username, password, email, phone, create_time, update_time) VALUES(?, ?, ?, ?, ?, ?)";

            ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            ps.setString(2, hashedPassword);
            ps.setString(3, email);
            ps.setString(4, phone);

            Timestamp now = Timestamp.valueOf(LocalDateTime.now());
            ps.setTimestamp(5, now);
            ps.setTimestamp(6, now);
            ps.executeUpdate();

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1062) {
                throw new RuntimeException("用户已存在", se);
            } else {
                throw new RuntimeException("数据库错误", se);
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("系统错误", e);
        } finally {
            try {
                if (ps != null) { ps.close(); }
                if (conn != null) { conn.close(); }
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
    }

    @Override
    public boolean checkUserExisted(String username) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = dataSource.getConnection();
            String sql = "SELECT * FROM users WHERE username = ?";

            ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            rs = ps.executeQuery();

            if (rs.next()) {
                return false;
            }

        } catch (SQLException se) {
            se.printStackTrace();
            throw new RuntimeException("Account existed", se);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Unexpected error", e);
        } finally {
            try {
                if (rs != null) { rs.close(); }
                if (ps != null) {ps.close();}
                if (conn != null) {conn.close();}
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
        return true;
    }

    @Override
    public boolean checkUserLogIn(String username, String password) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = dataSource.getConnection();
            String sql = "SELECT password FROM users WHERE username = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            rs = ps.executeQuery();

            if (rs.next()) {
                String hashedPassword = rs.getString("password");
                return BCrypt.checkpw(password, hashedPassword);
            }
            return false;
        } catch (SQLException se) {
            se.printStackTrace();
            throw new RuntimeException("Worng password", se);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Unexpected error", e);
        } finally {
            try {
                if (rs != null) { rs.close(); }
                if (ps != null) {ps.close();}
                if (conn != null) {conn.close();}
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
    }

    public UserInfo getUserInfo(String username) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = dataSource.getConnection();
            String sql = "SELECT username, phone, email, create_time FROM users WHERE username = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            rs = ps.executeQuery();

            if (rs.next()) {
                UserInfo userInfo = new UserInfo();
                userInfo.setUsername(rs.getString("username"));
                userInfo.setPhone(rs.getString("phone"));
                userInfo.setEmail(rs.getString("email"));
                userInfo.setCreateTime(rs.getTimestamp("create_time").toLocalDateTime());
                return userInfo;
            }
            return null;
        } catch (SQLException se) {
            se.printStackTrace();
            throw new RuntimeException("Database error when getting user info", se);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Unexpected error", e);
        } finally {
            try {
                if (rs != null) { rs.close(); }
                if (ps != null) { ps.close(); }
                if (conn != null) { conn.close(); }
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
    }

    @Override
    public boolean changeUserInfo(String username, String password, String phone, String email) {
        Connection conn = null;
        PreparedStatement ps = null;
        boolean have = false;

        try {
            conn = dataSource.getConnection();

            StringBuilder sql = new StringBuilder("UPDATE users SET ");
            List<Object> params = new ArrayList<>();
            List<String> setClauses = new ArrayList<>();

            if (password != null && !password.trim().isEmpty()) {
                setClauses.add("password = ?");
                String hashedPassword = BCrypt.hashpw(password, BCrypt.gensalt());
                params.add(hashedPassword);
                have = true;
            }

            if (phone != null && !phone.trim().isEmpty()) {
                setClauses.add("phone = ?");
                params.add(phone);
                have = true;
            }

            if (email != null && !email.trim().isEmpty()) {
                setClauses.add("email = ?");
                params.add(email);
                have = true;
            }

            if (have == true){
                Timestamp now = Timestamp.valueOf(LocalDateTime.now());
                setClauses.add("update_time = ?");
                params.add(now);
            }

            if (setClauses.isEmpty()) {
                return false;
            }

            sql.append(String.join(", ", setClauses));
            sql.append(" WHERE username = ?");
            params.add(username);

            ps = conn.prepareStatement(sql.toString());

            for (int i = 0; i < params.size(); i++) {
                ps.setObject(i + 1, params.get(i));
            }

            int rowsAffected = ps.executeUpdate();
            return rowsAffected > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            throw new RuntimeException("Database error when updating user info", se);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Unexpected error", e);
        } finally {
            try {
                if (ps != null) { ps.close(); }
                if (conn != null) { conn.close(); }
            } catch (SQLException se) {
                se.printStackTrace();
            }
        }
    }
}
