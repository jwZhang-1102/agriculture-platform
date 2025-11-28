package com.backend.ap.pojo_jw;

import lombok.Data;

@Data
public class cartRes {
    String status;
    String msg;
    cart cart;

    public static cartRes success(String status, String msg,cart cart) {
        cartRes cartRes = new cartRes();
        cartRes.status = status;
        cartRes.msg = msg;
        cartRes.cart = cart;
        return cartRes;
    }
}
