package com.supplementsAlarm.backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.supplementsAlarm.backend.dto.TestDto;
import com.supplementsAlarm.backend.service.TestService;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class TestController {
	
	private TestService testService;
	

	@GetMapping("/test")
	public String test() {
		
		List<TestDto> result = testService.test();
		
		
		return "/test 리액트";
		
	}
	
}
