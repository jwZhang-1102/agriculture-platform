package com.backend.ap.pojo_jw;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class chatMsg {
    Integer id;
    Integer user_id;
    String content;
    String message_type;
    String image_url;
    LocalDateTime created_at;
}
