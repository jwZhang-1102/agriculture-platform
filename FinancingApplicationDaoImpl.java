package com.backend.ap.dao_jw.impl;

import com.backend.ap.dao_jw.FinancingApplicationDao;
import org.springframework.stereotype.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Repository;

import javax.sql.DataSource;
import java.sql.*;
import java.util.ArrayList;
import java.util.List;

@Repository
public class FinancingApplicationDaoImpl implements FinancingApplicationDao {
    private final DataSource dataSource;

    public FinancingApplicationDaoImpl(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @Override
    public boolean financingApplication(String applicant, String realName, String idNum, float financingAmount) {
        Connection conn = null;
        PreparedStatement ps = null;

        try {
            conn = dataSource.getConnection();

            String sql = "INSERT INTO financing_applications (applicant, realName, idNum, financingAmount) " +
                    "VALUES(?, ?, ?, ?) ";

            ps = conn.prepareStatement(sql);
            ps.setString(1, applicant);
            ps.setString(2, realName);
            ps.setString(3, idNum);
            ps.setFloat(4, financingAmount);

            int affectedRows = ps.executeUpdate();
            return affectedRows > 0;

        } catch (SQLException se) {
            se.printStackTrace();
            if (se.getErrorCode() == 1452) {
                throw new RuntimeException("用户不存在", se);
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
}
