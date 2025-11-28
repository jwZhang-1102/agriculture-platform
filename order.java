package com.backend.ap.pojo_jw;

import lombok.Data;

@Data
public class order {
    String username;
    String order_number;
    int total_amount;
    String status;
    int product_id;
    int quantity;
}
