package com.backend.ap.service_jw.impl;

import com.backend.ap.dao_jw.OrdersDao;
import com.backend.ap.dao_jw.UserRegisterDao;
import com.backend.ap.pojo_jw.order;
import com.backend.ap.service_jw.OrdersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class OrdersServiceImpl implements OrdersService {
    @Autowired
    private OrdersDao ordersDao;

    @Override
    public order[] getUserOrdersByName(String username) {
        return ordersDao.getUserOrders(username);
    }

    @Override
    public String addOrder(String username, String recipient, String address, int product_id, int quantity) {
        return ordersDao.addOrder(username, recipient, address, product_id, quantity);
    }

    @Override
    public boolean addCart(String owner, int product_id, int quantity) {
        return ordersDao.addCart(owner, product_id, quantity);
    }

    @Override
    public boolean updateCart(String owner, int product_id, int quantity) {
        return ordersDao.updateCart(owner, product_id, quantity);
    }

    @Override
    public boolean removeProductFromCart(String owner, int product_id) {
        return ordersDao.removeProductFromCart(owner, product_id);
    }

    @Override
    public boolean clearOutCart(String owner) {
        return ordersDao.clearOutCart(owner);
    }

    @Override
    public boolean addAddress(String owner, String address, String recipient, String phone) {
        return ordersDao.addAddress(owner, address, recipient, phone);
    }
}
