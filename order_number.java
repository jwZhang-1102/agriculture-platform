package com.backend.ap.pojo_jw;

import lombok.Data;

@Data
public class order_number {
    public String status;
    private String order_number;

    public static order_number success(String status, String order_number) {
        order_number order_number1 = new order_number();
        order_number1.status = status;
        order_number1.order_number = order_number;
        return order_number1;
    }
}
