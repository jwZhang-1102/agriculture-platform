package com.backend.ap.service_jw.impl;

import com.backend.ap.dao_jw.impl.FinancingApplicationDaoImpl;
import com.backend.ap.service_jw.FinancingApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FinancingApplicationServiceImpl implements FinancingApplicationService {
    @Autowired
    private FinancingApplicationDaoImpl financingApplicationDaoImpl;

    @Override
    public boolean financingApplication(String applicant, String realName, String idNum, float financingAmount) {
        return financingApplicationDaoImpl.financingApplication(applicant, realName, idNum, financingAmount);
    }
}
