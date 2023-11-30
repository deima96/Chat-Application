package com.deimaphi.ChatApplication.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.deimaphi.ChatApplication.controller.model.Message;

@Controller
public class WebSocketController {
	
	@Autowired
	SimpMessagingTemplate messagingTemplate;
	
	@MessageMapping("/public-message")
	@SendTo("/group/public")
	public Message publicMessage(@Payload Message message) {
		return message;
	}
	
	@MessageMapping("/private-message")
	public Message privateMessage(@Payload Message message) {
		messagingTemplate.convertAndSendToUser(message.getReceiverName(), "/private", message);
		return message;
	}
	
	
}
