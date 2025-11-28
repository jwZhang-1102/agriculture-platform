package com.backend.ap.controller_jw;

import com.backend.ap.pojo_jw.*;
import com.backend.ap.service_jw.UserRegisterService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class UserRegisterController {
    @Autowired
    private UserRegisterService userRegisterService;

    @PostMapping("/api/auth/register")
    public AuthReturn UserRegister(@RequestBody Map<String, Object> requestMap){
        String username = (String) requestMap.get("username");
        String password = (String) requestMap.get("password");
        String email = (String) requestMap.get("email");
        String phone = (String) requestMap.get("phone");
            //@RequestParam("username") String username,
            //@RequestParam("password") String password,
            //@RequestParam("email") String email,
            //@RequestParam("phone") String phone){

        System.out.println("收到注册请求");
        System.out.println("Received username: " + username);
        System.out.println("Received password: " + password);

        if (userRegisterService.judgeUserExist(username, password, email, phone)) {
            String token = generateToken(username);
            data data = new data();
            data.setUsername(username);
            data.setToken(token);
            return new AuthReturn().success("success","注册成功",data);
        } else {
            return AuthReturn.error("error", "用户名已存在", null);
        }
    }

    @PostMapping("/api/auth/login")
    public AuthReturn UserLogin(@RequestBody Map<String, Object> requestMap){
        String username = (String) requestMap.get("username");
        String password = (String) requestMap.get("password");
            //@RequestParam("username") String username,
            //RequestParam("password") String password){
        System.out.println("收到登录请求");
        System.out.println("Received username: " + username);

        if (userRegisterService.judgeUserLogIn(username, password)) {
            String token = generateToken(username);
            data data = new data();
            data.setUsername(username);
            data.setToken(token);
            return new AuthReturn().success("success","登录成功",data);
        } else {
            return AuthReturn.error("error", "密码错误", null);
        }
    }

    @GetMapping("/api/user/profile")
    public GetUserInfo getUserInfo(@RequestBody Map<String, Object> requestMap){
        String username = (String) requestMap.get("username");
            //@RequestParam("username") String username){
        System.out.println("收到获取用户信息请求："+ username);

        if(userRegisterService.getUserInfoByName(username) != null){
            UserInfo  userInfo = userRegisterService.getUserInfoByName(username);
            return new GetUserInfo().success("success",userInfo);
        }else {
            return new GetUserInfo().success("error",null);
        }
    }

    @GetMapping("/api/user/change")
    public changeUserInfo changeUserInfo(
            @RequestParam("username") String username,
            @RequestParam("password") String password,
            @RequestParam("phone") String phone,
            @RequestParam("email") String email){
        System.out.println(username + "更改信息");
        if(userRegisterService.changeUserInfo(username, password, phone, email)){
            changeUserInfo changeUserInfo = new changeUserInfo();
            changeUserInfo.setStatus("success");
            changeUserInfo.setMsg(username+"信息已修改成功");
            return changeUserInfo;
        }else {
            changeUserInfo changeUserInfo = new changeUserInfo();
            changeUserInfo.setStatus("error");
            changeUserInfo.setMsg(username+"信息修改失败");
            return changeUserInfo;
        }
    }

    private String generateToken(String username) {
        return "token_" + username + "_" + System.currentTimeMillis();
    }
}
