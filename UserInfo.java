package com.backend.ap.pojo_jw;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserInfo {
    String username;
    String phone;
    String email;
    LocalDateTime createTime;
}
