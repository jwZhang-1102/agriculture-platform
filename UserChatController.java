package com.backend.ap.controller_jw;

import com.backend.ap.pojo_jw.*;
import com.backend.ap.service_jw.UseChatService;
import io.micrometer.common.util.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class UserChatController {
    @Autowired
    private UseChatService useChatService;

    @PostMapping("/api/chat/send")
    public response send(@RequestBody Map<String, Object> requestMap) {
        Integer user_id = (Integer) requestMap.get("user_id");
        String content = (String) requestMap.get("content");
        String message_type = (String) requestMap.get("message_type");
        String image_url = (String) requestMap.get("image_url");

        if (user_id == null) {
            return response.error("用户ID不能为空");
        }

        if (!"TEXT".equals(message_type) && !"IMAGE".equals(message_type)) {
            message_type = "TEXT";
        }

        if ("TEXT".equals(message_type)) {
            if (StringUtils.isBlank(content)) {
                return response.error("文本消息内容不能为空");
            }
        } else {
            if (StringUtils.isBlank(image_url) && StringUtils.isBlank(content)) {
                return response.error("图片消息必须有图片或描述");
            }
        }

        try {
            boolean result = useChatService.sendMsg(user_id, content, message_type, image_url);
            if (result) {
                System.out.println("用户"+ user_id + "发言，内容为：" + content);
                return response.success("消息发送成功");
            } else {
                return response.error("消息发送失败");
            }
        } catch (Exception e) {
            return response.error("系统错误: " + e.getMessage());
        }
    }

    @GetMapping("api/chat/browse")
    public chatMsgs browse() {
        List<chatMsg> msgs = useChatService.browse();
        if (msgs != null){
            return chatMsgs.success("success", msgs);
        } else {
            return chatMsgs.wrong("wrong", null);
        }
    }
}
