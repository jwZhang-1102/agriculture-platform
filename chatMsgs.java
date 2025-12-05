package com.backend.ap.pojo_jw;

import lombok.Data;
import java.util.List;

@Data
public class chatMsgs {
    private String status;
    private List<chatMsg> messages;

    public static chatMsgs success(String status, List<chatMsg> messages) {
        chatMsgs msg = new chatMsgs();
        msg.setStatus(status);
        msg.setMessages(messages);
        return msg;
    }

    public static chatMsgs wrong(String status, List<chatMsg> messages) {
        chatMsgs msg = new chatMsgs();
        msg.setStatus(status);
        msg.setMessages(messages);
        return msg;
    }
}