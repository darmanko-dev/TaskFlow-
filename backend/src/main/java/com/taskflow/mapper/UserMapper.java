package com.taskflow.mapper;

import com.taskflow.dto.response.UserResponse;
import com.taskflow.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "fullName", expression = "java(user.getFirstName() + \" \" + user.getLastName())")
    UserResponse toResponse(User user);

    List<UserResponse> toResponseList(List<User> users);
}
