package com.supplementsAlarm.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.supplementsAlarm.backend.dto.TestDto;
import com.supplementsAlarm.backend.mapper.TestMapper;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class TestService {
	
	private final TestMapper testMapper;

	public List<TestDto> test() {
					
		return testMapper.test("");
	}
	
		
}
