# Rundeck

### 注意
* rundeckにログインしたら、API利用できなくなるので、API利用廃棄、RundeckのWeb画面を利用
*

### rundeck api
* format:json | xml
* api list
    * jobs    /jobs
    * job     /job/{job_id}
    * 実行中   /executions/running
* url sample
    * http://server/rundeck/api/16/project/TestPrj/jobs/export?authtoken={token}