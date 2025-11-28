package com.backend.ap.controller_jw;

import com.backend.ap.pojo_jw.order;
import com.backend.ap.pojo_jw.order_number;
import com.backend.ap.pojo_jw.orders;
import com.backend.ap.pojo_jw.response;
import com.backend.ap.service_jw.OrdersService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class OrdersController {
    @Autowired
    private OrdersService ordersService;

    @GetMapping("/api/user/order")
    public orders getUserOrder(
            @RequestParam("username") String username){
        System.out.println("正在查询用户"+ username + "的订单信息");

        if(ordersService.getUserOrdersByName(username) != null){
            order[] orders = ordersService.getUserOrdersByName(username);
            return new orders().success("success", orders);
        }else {
            return new orders().success("error",null);
        }
    }

    @PostMapping("/api/add/order")
    public order_number createOrder(@RequestBody Map<String, Object> requestMap){
        String username = (String) requestMap.get("username");
        String recipient = (String) requestMap.get("recipient");
        String address = (String) requestMap.get("address");
        int product_id = ((Number) requestMap.get("product_id")).intValue();
        int quantity = ((Number) requestMap.get("quantity")).intValue();
            //@RequestParam("username") String username,
            //@RequestParam("recipient")  String recipient,
            //@RequestParam("address")   String address,
            //@RequestParam("product_id") int product_id,
            //@RequestParam("quantity") int quantity){

        System.out.println("用户"+ username + "创建了新的订单");

        return new order_number().success("success",ordersService.addOrder(username, recipient, address,product_id, quantity));
    }

    @PostMapping("/api/add/cart")
    public response addCart(@RequestBody Map<String, Object> requestMap){
        String owner = (String) requestMap.get("owner");
        int product_id = ((Number) requestMap.get("product_id")).intValue();
        int quantity = ((Number) requestMap.get("quantity")).intValue();
            //@RequestParam("owner") String owner,
            //@RequestParam("product_id") int product_id,
            //@RequestParam("quantity") int quantity){
        System.out.println("用户"+ owner + "添加新商品至购物车");

        if(ordersService.addCart(owner, product_id, quantity)){
            response response = new response();
            response.setStatus("success");
            response.setMsg("添加商品至购物车成功");
            return response;
        }else{
            response response = new response();
            response.setStatus("error");
            response.setMsg("添加商品失败");
            return response;
        }
    }

    @PutMapping("api/update/cart")
    public response updateCart(@RequestBody Map<String, Object> requestMap){
        String owner = (String) requestMap.get("owner");
        int product_id = ((Number) requestMap.get("product_id")).intValue();
        int quantity = ((Number) requestMap.get("quantity")).intValue();
            //@RequestParam("owner") String owner,
            //@RequestParam("product_id") int product_id,
            //@RequestParam("quantity") int quantity){

        System.out.println("用户"+ owner + "更新购物车中的商品"+ product_id + "数量");

        if(ordersService.updateCart(owner, product_id, quantity)){
            response response = new response();
            response.setStatus("success");
            response.setMsg("商品数量修改成功");
            return response;
        }else{
            response response = new response();
            response.setStatus("error");
            response.setMsg("添加商品失败");
            return response;
        }
    }

    @DeleteMapping("api/remove/cart")
    public response removeCart(@RequestBody Map<String, Object> requestMap){
        String owner = (String) requestMap.get("owner");
        int product_id = ((Number) requestMap.get("product_id")).intValue();
            //@RequestParam("owner") String owner,
            //@RequestParam("product_id") int product_id){
        System.out.println("用户"+ owner + "删除购物车中的商品" + product_id);
        if(ordersService.removeProductFromCart(owner, product_id)){
            response response = new response();
            response.setStatus("success");
            response.setMsg("用户"+ owner + "删除购物车中的商品" + product_id);
            return response;
        }else{
            response response = new response();
            response.setStatus("error");
            response.setMsg("添加商品失败");
            return response;
        }
    }

    @DeleteMapping("api/clearout/cart")
    public response clearoutCart(@RequestBody Map<String, Object> requestMap){
        String owner = (String) requestMap.get("owner");
            //@RequestParam("owner") String owner){
        System.out.println("用户"+ owner + "清空购物车");

        if(ordersService.clearOutCart(owner)){
            response response = new response();
            response.setStatus("success");
            response.setMsg("已清空购物车");
            return response;
        }else{
            response response = new response();
            response.setStatus("error");
            response.setMsg("添加商品失败");
            return response;
        }
    }

    @PostMapping("api/add/address")
    public response addAddress(@RequestBody Map<String, Object> requestMap){
        String owner = (String) requestMap.get("owner");
        String address = (String) requestMap.get("address");
        String recipient = (String) requestMap.get("recipient");
        String phone = (String) requestMap.get("phone");
            //@RequestParam("owner") String owner,
            //@RequestParam("address") String address,
            //@RequestParam("recipient") String recipient,
            //@RequestParam("phone") String phone){
        System.out.println("用户"+ owner + "添加了新地址");

        if(ordersService.addAddress(owner, address, recipient, phone)){
            response response = new response();
            response.setStatus("success");
            response.setMsg("新地址添加成功");
            return response;
        }else{
            response response = new response();
            response.setStatus("error");
            response.setMsg("新地址添加失败");
            return response;
        }
    }
}
