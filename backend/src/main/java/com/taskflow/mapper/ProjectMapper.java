package com.taskflow.mapper;

import com.taskflow.dto.response.ProjectResponse;
import com.taskflow.entity.Project;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {UserMapper.class})
public interface ProjectMapper {

    @Mapping(target = "members", source = "members")
    @Mapping(target = "totalTasks", ignore = true)
    @Mapping(target = "completedTasks", ignore = true)
    @Mapping(target = "progressPercentage", ignore = true)
    ProjectResponse toResponse(Project project);

    List<ProjectResponse> toResponseList(List<Project> projects);
}
