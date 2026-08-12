package it.createlab.gamificationhub.api.utils;

import java.util.UUID;

public class GameConceptUtils {

    private GameConceptUtils(){}

    public static String newId() {
        return UUID.randomUUID().toString().replaceAll("-", "").strip();
    }

}
