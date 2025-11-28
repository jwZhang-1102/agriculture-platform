package com.backend.ap.pojo_jw;

import lombok.Data;

@Data
public class AuthReturn {
    private String status;
    private String msg;
    private data data;

    public static AuthReturn success(String status, String msg, data data) {
        AuthReturn authReturn = new AuthReturn();
        authReturn.status = status;
        authReturn.msg = msg;
        authReturn.data = data;
        return authReturn;
    }

    public static AuthReturn error(String status, String msg, data data) {
        AuthReturn authReturn = new AuthReturn();
        authReturn.status = status;
        authReturn.msg = msg;
        authReturn.data = data;
        return authReturn;
    }
}

