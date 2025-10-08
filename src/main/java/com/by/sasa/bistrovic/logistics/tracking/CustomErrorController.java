package com.by.sasa.bistrovic.logistics.tracking;

import org.springframework.boot.web.servlet.error.ErrorController;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class CustomErrorController implements ErrorController {    
    @RequestMapping("/error")
    public String handleError() {
        // Preusmeri na React aplikaciju
        return "forward:/index.html";
    }    
}
