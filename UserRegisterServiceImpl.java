package com.backend.ap.service_jw.impl;

import com.backend.ap.dao_jw.UserRegisterDao;
import com.backend.ap.pojo_jw.UserInfo;
import com.backend.ap.service_jw.UserRegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UserRegisterServiceImpl implements UserRegisterService {
    @Autowired
    private UserRegisterDao userRegisterDao;

    @Override
    public boolean judgeUserExist(String username, String password, String email, String phone) {
        if (!userRegisterDao.checkUserExisted(username)) {
            return false;
        } else {
            userRegisterDao.registerUser(username, password,
                    email, phone);
            return true;
        }
    }

    @Override
    public boolean judgeUserLogIn(String username, String password) {
        if (userRegisterDao.checkUserLogIn(username, password)) {
            return true;
        } else {
            return false;
        }
    }

    @Override
    public UserInfo getUserInfoByName(String username) {
        return userRegisterDao.getUserInfo(username);
    }

    @Override
    public boolean changeUserInfo(String username, String password, String phone, String email) {
        return userRegisterDao.changeUserInfo(username, password, phone, email);
    }


}
