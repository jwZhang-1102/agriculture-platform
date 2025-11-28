package com.backend.ap.dao_jw.impl;

import com.backend.ap.dao_jw.OrdersDao;
import com.backend.ap.pojo_jw.order;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class OrdersDaoImpl implements OrdersDao {
    private final DataSource dataSource;

    @Autowired
    public OrdersDaoImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public order[] getUserOrders(String username) {
        Connection conn = null;
        PreparedStatement ps = null;
        ResultSet rs = null;

        List<order> orderList = new ArrayList<>();

        try {
            conn = dataSource.getConnection();

            String sql = "SELECT username, order_number, total_amount, status, product_id, quantity  FROM orders WHERE username = ?";
            ps = conn.prepareStatement(sql);
            ps.setString(1, username);

            rs = ps.executeQuery();

            while (rs.next()) {
                order order = new order();
                order.setUsername(rs.getString("username"));
                order.setOrder_number(rs.getString("order_number"));
                order.setTotal_amount(rs.getInt("total_amount"));
                order.setStatus(rs.getString("status"));
                order.setProduct_id(rs.getInt("product_id"));
                order.setQuantity(rs.getInt("quantity"));

                orderList.add(order);
            }

            return orderList.toArray(orderList.toArray(new order[0]));

        } catch (SQLException e) {
            e.printStackTrace();
            return new order[0];
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

    @Override
    public String addOrder(String username, String recipient, String address,int product_id, int quantity) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            String sql = "INSERT INTO orders (username, recipient, address, product_id, quantity, status, created_at, updated_at) VALUES(?, ?, ?, ?, ?, ?, NOW(), NOW())";

            ps = conn.prepareStatement(sql);
            ps.setString(1, username);
            ps.setString(2, recipient);
            ps.setString(3, address);
            ps.setInt(4, product_id);
            ps.setInt(5, quantity);
            ps.setString(6, "pending");

            int affectedRows = ps.executeUpdate();
            if (affectedRows > 0) {
                return getLatestOrderNumber(username, product_id, quantity, conn);
            }
            return null;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("产品不存在", se);
            } else if (se.getErrorCode() == 1062) {
                throw new RuntimeException("订单号重复", se);
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
    public boolean addCart(String owner, int product_id, int quantity) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            String sql = "INSERT INTO cart_items (owner, product_id, quantity, added_at) VALUES(?, ?, ?, NOW()) " +
                    "ON DUPLICATE KEY UPDATE quantity = quantity + ?, added_at = NOW()";

            ps = conn.prepareStatement(sql);
            ps.setString(1, owner);
            ps.setInt(2, product_id);
            ps.setInt(3, quantity);
            ps.setInt(4, quantity);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("产品不存在", se);
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
    public boolean updateCart(String owner, int product_id, int quantity) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            String sql = "UPDATE cart_items SET quantity = ?, added_at = NOW() " +
                    "WHERE owner = ? AND product_id = ?";

            ps = conn.prepareStatement(sql);
            ps.setInt(1, quantity);
            ps.setString(2, owner);
            ps.setInt(3, product_id);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("产品不存在", se);
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
    public boolean removeProductFromCart(String owner, int product_id) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            String sql = "DELETE FROM cart_items WHERE owner = ? AND product_id = ? ";

            ps = conn.prepareStatement(sql);
            ps.setString(1, owner);
            ps.setInt(2, product_id);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("产品不存在", se);
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
    public boolean clearOutCart(String owner) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            String sql = "DELETE FROM cart_items WHERE owner = ? ";

            ps = conn.prepareStatement(sql);
            ps.setString(1, owner);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("产品不存在", se);
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
    public boolean addAddress(String owner, String address, String recipient, String phone) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            String sql = "INSERT INTO address (owner, address, recipient, phone) VALUES(?, ?, ?, ?) ";

            ps = conn.prepareStatement(sql);
            ps.setString(1, owner);
            ps.setString(2, address);
            ps.setString(3, recipient);
            ps.setString(4, phone);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("产品不存在", se);
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

    private String getLatestOrderNumber(String username, int product_id, int quantity, Connection conn) throws SQLException {
        String querySql = "SELECT order_number FROM orders WHERE username = ? AND product_id = ? AND quantity = ? ORDER BY created_at DESC LIMIT 1";

        try (PreparedStatement ps = conn.prepareStatement(querySql)) {
            ps.setString(1, username);
            ps.setInt(2, product_id);
            ps.setInt(3, quantity);

            try (ResultSet rs = ps.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("order_number");
                } else {
                    throw new RuntimeException("未找到对应的订单");
                }
            }
        }
    }
}
