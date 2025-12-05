package com.backend.ap.service_jw;

import com.backend.ap.pojo_jw.chatMsg;

import java.util.List;


public interface UseChatService {
    boolean sendMsg(Integer user_id, String content, String message_type, String image_url);
    public List<chatMsg> browse();
}
