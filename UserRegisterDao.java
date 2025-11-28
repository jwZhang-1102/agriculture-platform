package com.backend.ap.dao_jw;

import com.backend.ap.pojo_jw.UserInfo;
import com.backend.ap.pojo_jw.order;
import com.backend.ap.pojo_jw.orders;

public interface UserRegisterDao {
    public void registerUser(String username, String password,
                             String email, String phone);
    public boolean checkUserExisted(String username);
    public boolean checkUserLogIn(String username, String password);
    public UserInfo getUserInfo(String username);
    public boolean changeUserInfo(String username, String password, String phone, String email);

}
