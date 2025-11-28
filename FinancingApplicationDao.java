package com.backend.ap.dao_jw;

public interface FinancingApplicationDao {
    public boolean financingApplication(String applicant, String realName, String idNum, float financingAmount);
}
