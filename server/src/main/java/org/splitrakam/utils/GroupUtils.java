package org.splitrakam.utils;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.splitrakam.model.Group;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

public class GroupUtils {

    public static final String GROUP_JSON_FILE_PATH = "/data/groups.json";
    ObjectMapper objectMapper = new ObjectMapper();

    public void saveGroup(List<Group> groups) {
        try {
            objectMapper.writerWithDefaultPrettyPrinter().writeValue(new File(GROUP_JSON_FILE_PATH), groups);
        } catch (IOException e) {
            throw new RuntimeException("Failed to save new group", e);
        }
    }

    public List<Group> loadExistingGroups() {
        try {
            File file = new File(GROUP_JSON_FILE_PATH);

            if (!file.exists()) {
                throw new IOException("Group file is not present");
            }

            return objectMapper.readValue(file, new TypeReference<List<Group>>() {});   //TODO why List<Group> doesn't work
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
}
