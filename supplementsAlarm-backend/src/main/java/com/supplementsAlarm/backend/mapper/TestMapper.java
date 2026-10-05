package com.supplementsAlarm.backend.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.supplementsAlarm.backend.dto.TestDto;

@Mapper
public interface TestMapper {
	List<TestDto> test(String str);
}
