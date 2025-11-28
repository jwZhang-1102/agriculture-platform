package com.backend.ap.service_jw;

import com.backend.ap.pojo_jw.order;

public interface OrdersService {
    public order[] getUserOrdersByName(String username);
    public String addOrder(String username, String recipient, String address, int product_id, int quantity);
    public boolean addCart(String owner, int product_id, int quantity);
    public boolean updateCart(String owner, int product_id, int quantity);
    public boolean removeProductFromCart(String owner, int product_id);
    public boolean clearOutCart(String owner);
    public boolean addAddress(String owner, String address, String recipient, String phone);
}
