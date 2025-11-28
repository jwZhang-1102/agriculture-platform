package com.backend.ap.controller_jw;

import com.backend.ap.pojo_jw.response;
import com.backend.ap.service_jw.FinancingApplicationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*")
@RestController
public class FinancingApplicationController {
    @Autowired
    private FinancingApplicationService financingApplicationService;

    @PostMapping("/api/financingApplication")
    public response financingApplication(@RequestBody Map<String, Object> requestMap){
        String applicant = (String) requestMap.get("applicant");
        String realName = (String) requestMap.get("realName");
        String idNum = (String) requestMap.get("idNum");
        float financingAmount = ((Number) requestMap.get("financingAmount")).floatValue();
        //@RequestParam("applicant") String applicant,
        //@RequestParam("realName") String realName,
        //@RequestParam("idNum") String idNum,
        //@RequestParam("financingAmount") float financingAmount){
        System.out.println("用户"+ applicant + "申请了融资" + "金额：" + financingAmount);

        if(financingApplicationService.financingApplication(applicant, realName, idNum, financingAmount)){
            response response = new response();
            response.setStatus("success");
            response.setMsg("融资申请成功");
            return response;
        }else{
            response response = new response();
            response.setStatus("error");
            response.setMsg("融资申请失败");
            return response;
        }
    }
}
