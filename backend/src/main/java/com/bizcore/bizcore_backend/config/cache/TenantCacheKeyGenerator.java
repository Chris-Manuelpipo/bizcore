package com.bizcore.bizcore_backend.config.cache;

import com.bizcore.bizcore_backend.security.TenantContext;
import org.springframework.cache.interceptor.KeyGenerator;
import org.springframework.stereotype.Component;

import java.util.UUID;

import java.lang.reflect.Method;
import java.util.Arrays;
import java.util.Objects;
import java.util.stream.Collectors;

@Component
public class TenantCacheKeyGenerator implements KeyGenerator {

    @Override
    public Object generate(Object target, Method method, Object... params) {
        UUID tenantUuid = TenantContext.getTenantId();
        String tenantId = tenantUuid != null ? tenantUuid.toString() : "public";
        String methodName = method.getName();
        String paramsKey = Arrays.stream(params)
                .map(param -> Objects.toString(param, "null"))
                .collect(Collectors.joining(":"));

        return String.format("%s:%s:%s", tenantId, methodName, paramsKey);
    }
}