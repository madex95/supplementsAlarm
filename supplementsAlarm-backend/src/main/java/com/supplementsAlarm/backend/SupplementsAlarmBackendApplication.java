package com.supplementsAlarm.backend;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.jdbc.autoconfigure.DataSourceAutoConfiguration;
import org.springframework.boot.security.autoconfigure.SecurityAutoConfiguration;

@SpringBootApplication(exclude = {
		DataSourceAutoConfiguration.class,
		SecurityAutoConfiguration.class
		})
public class SupplementsAlarmBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(SupplementsAlarmBackendApplication.class, args);
		
		System.out.println("구동시작");
	}

}
