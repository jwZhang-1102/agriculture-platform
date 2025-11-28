package com.backend.ap.pojo_jw;

import lombok.Data;

@Data
public class orders {
    String status;
    order order[] = new order[5];

    public static orders success(String status, order[] order) {
        orders orders = new  orders();
        orders.status = status;
        orders.order = order;
        return orders;
    }
}
