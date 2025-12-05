package com.backend.ap.dao_jw;

import com.backend.ap.pojo_jw.chatMsg;

import java.util.List;

public interface UserChatDao {
    boolean sendMsg(Integer user_id, String content, String message_type, String image_url);
    public boolean checkUserExisted(Integer userid);
    public List<chatMsg> browse();
}
