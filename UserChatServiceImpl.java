package com.backend.ap.service_jw.impl;

import com.backend.ap.dao_jw.impl.UserChatDaoImpl;
import com.backend.ap.pojo_jw.chatMsg;
import com.backend.ap.service_jw.UseChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserChatServiceImpl implements UseChatService {
    @Autowired
    private UserChatDaoImpl userChatDaoImpl;

    @Override
    public boolean sendMsg(Integer user_id, String content, String message_type, String image_url) {
        return userChatDaoImpl.sendMsg(user_id, content, message_type, image_url);
    }

    @Override
    public List<chatMsg> browse() {
        return userChatDaoImpl.browse();
    }
}
