package no.nav.data.common;

import net.javacrumbs.shedlock.spring.annotation.EnableSchedulerLock;
import no.nav.data.common.utils.MdcUtils;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.Trigger;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.SchedulingConfigurer;
import org.springframework.scheduling.concurrent.ConcurrentTaskScheduler;
import org.springframework.scheduling.config.ScheduledTaskRegistrar;

import java.time.Duration;
import java.util.Date;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledFuture;

@Configuration
@EnableScheduling
@EnableSchedulerLock(defaultLockAtMostFor = "PT10M", defaultLockAtLeastFor = "PT59s")
public class SchedulerConfig implements SchedulingConfigurer {

    @Override
    public void configureTasks(ScheduledTaskRegistrar taskRegistrar) {
        taskRegistrar.setTaskScheduler(new Scheduler());
    }

    private static class Scheduler extends ConcurrentTaskScheduler {

        public static final String SCHEDULER_NAME = "scheduler";

        public Scheduler() {
            super(Executors.newSingleThreadScheduledExecutor());
        }

        @Override
        public ScheduledFuture<?> schedule(Runnable task, Trigger trigger) {
            return super.schedule(wrap(task), trigger);
        }

        @Override
        public ScheduledFuture<?> scheduleAtFixedRate(Runnable task, Date startTime, long period) {
            return super.scheduleAtFixedRate(wrap(task), startTime.toInstant(), Duration.ofMillis(period));
        }

        @Override
        public ScheduledFuture<?> scheduleAtFixedRate(Runnable task, long period) {
            return super.scheduleAtFixedRate(wrap(task), Duration.ofMillis(period));
        }

        @Override
        public ScheduledFuture<?> schedule(Runnable task, Date startTime) {
            return super.schedule(wrap(task), startTime.toInstant());
        }

        @Override
        public ScheduledFuture<?> scheduleWithFixedDelay(Runnable task, Date startTime, long delay) {
            return super.scheduleWithFixedDelay(wrap(task), startTime.toInstant(), Duration.ofMillis(delay));
        }

        @Override
        public ScheduledFuture<?> scheduleWithFixedDelay(Runnable task, long delay) {
            return super.scheduleWithFixedDelay(wrap(task), Duration.ofMillis(delay));
        }

        private Runnable wrap(Runnable task) {
            return MdcUtils.wrapAsync(task, SCHEDULER_NAME);
        }
    }
}
