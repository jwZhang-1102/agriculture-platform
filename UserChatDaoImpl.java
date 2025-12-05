package com.backend.ap.dao_jw.impl;

import com.backend.ap.dao_jw.UserChatDao;
import com.backend.ap.pojo_jw.chatMsg;
import com.backend.ap.pojo_jw.order;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.List;

@Repository
public class UserChatDaoImpl implements UserChatDao {
    private final DataSource dataSource;

    public UserChatDaoImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public boolean sendMsg(Integer user_id, String content, String message_type, String image_url) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            if (!checkUserExisted(user_id)) {
                throw new RuntimeException("用户不存在，ID: " + user_id);
            }

            String sql = "INSERT INTO public_chat_message (user_id, content, message_type, image_url)" +
                    "VALUES(?, ?, ?, ?) " ;

            ps = conn.prepareStatement(sql);
            ps.setInt(1, user_id);
            ps.setString(2, content);
            ps.setString(3, message_type);
            ps.setString(4, image_url);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("wrong", se);
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
    public boolean checkUserExisted(Integer user_id) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        try {
            conn = dataSource.getConnection();
            String sql = "SELECT COUNT(*) FROM users WHERE user_id = ?";

            ps = conn.prepareStatement(sql);
            ps.setInt(1, user_id);
            rs = ps.executeQuery();

            if (rs.next()) {
                int count = rs.getInt(1);
                return count > 0;
            }

        } catch (SQLException se) {
            se.printStackTrace();
            throw new RuntimeException("检查用户存在性时出错", se);
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("未知错误", e);
        }
        return false;
    }
    @Override
    public List<chatMsg> browse() {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        List<chatMsg> chatMsgList = new ArrayList<>();

        try {
            conn = dataSource.getConnection();

            String sql = "SELECT id, user_id, content, message_type, image_url FROM public_chat_message";
            ps = conn.prepareStatement(sql);

            rs = ps.executeQuery();

            while (rs.next()) {
                chatMsg msg = new chatMsg();
                msg.setId(rs.getInt("id"));
                msg.setUser_id(rs.getInt("user_id"));
                msg.setContent(rs.getString("content"));
                msg.setMessage_type(rs.getString("message_type"));
                msg.setImage_url(rs.getString("image_url"));

                chatMsgList.add(msg);
            }

            return chatMsgList;

        } catch (SQLException e) {
            e.printStackTrace();
            return chatMsgList;
        } finally {
            try {
                if (rs != null) rs.close();
                if (ps != null) ps.close();
                if (conn != null) conn.close();
            } catch (SQLException e) {
                e.printStackTrace();
            }
        }
    }
}
