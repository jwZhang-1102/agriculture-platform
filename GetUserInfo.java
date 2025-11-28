package com.backend.ap.pojo_jw;

import lombok.Data;

@Data
public class GetUserInfo {
    String status;
    UserInfo userInfo;

    public static GetUserInfo success(String status, UserInfo userInfo) {
        GetUserInfo getUserInfo = new GetUserInfo();
        getUserInfo.status = status;
        getUserInfo.userInfo = userInfo;
        return getUserInfo;
    }
}
