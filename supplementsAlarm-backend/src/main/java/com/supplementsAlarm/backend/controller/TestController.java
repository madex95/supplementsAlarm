package com.supplementsAlarm.backend.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TestController {

	@GetMapping("/test")
	public String test() {
		
		System.out.println("/test 스프링부터");
		
		return "/test 리액트";
		
	}
	
}
