package com.backend.ap.service_jw;

import com.backend.ap.pojo_jw.UserInfo;

public interface UserRegisterService {
    public boolean judgeUserExist(String username, String password, String email, String phone);
    public boolean judgeUserLogIn(String username, String password);
    public UserInfo getUserInfoByName(String username);
    public boolean changeUserInfo(String username, String password, String phone, String email);

}
