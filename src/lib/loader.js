var path = require('path');
var fs = require('fs');
var argv = require('yargs').argv;

var jobsArray = [];

var configTags = argv.configTags || [];

//Get application configs
function getConfigs(_base, _dir) {
    var _path = _base + "/" + _dir;
    var list = fs.readdirSync(_path);
    for(var i=0;i<list.length;i++) {
        var file = list[i];

        if(file[0] !== ".") {
            if(fs.lstatSync(_path + "/" + file).isDirectory()) {
                getConfigs(_path, file)
            }
            else {
                var config = JSON.parse(fs.readFileSync(path.resolve(__dirname, _path + "/" + file)).toString());
                if(configTags.length > 0 && configTags.indexOf(config.tag) < 0) {
                    continue;
                }
                if(!config.exclude) {
                    var id = _dir + "/" + file;

                    var jobEnv = "";
                    if(config.jobs.env) {
                        jobEnv = config.jobs.env;
                        delete config.jobs.env;
                    }

                    for(var jobType in config.jobs) {
                        for(var jobId in config.jobs[jobType]) {
                            var newJobId = id + "_" + jobId;
                            if(!jobsArray[jobType]) {
                                jobsArray[jobType] = {};
                            }
                            jobsArray[jobType][newJobId] = config.jobs[jobType][jobId]
                            jobsArray[jobType][newJobId].id = jobId;
                            if(!jobsArray[jobType][newJobId].env && jobEnv) {
                                jobsArray[jobType][newJobId].env = jobEnv;
                            }
                            delete config.jobs[jobType][jobId];
                        }
                    }
                }
            }
        }
    }
}


var jobs = {};
var appConfigPath = path.resolve(__dirname, '../config/application');
getConfigs(appConfigPath, "");

if(!process.env.DISABLE_DASHBOARD) {
    //Set the Cosmos environment
    var jobs = [];
    for(var jobType in jobsArray) {
        try {
            var job_path = process.env.JOB_PATH || path.resolve(__dirname, '../jobs');
            job_path += "\\"+jobType.toLowerCase() + ".js";

            var jobClass = require(job_path)();
            var jobGroup = jobsArray[jobType];
            for(var id in jobGroup) {

                if(typeof(jobGroup[id].env) === "undefined") {
                    jobGroup[id].env = "live";
                }
                var job = new jobClass(jobGroup[id]);

                job.start();

            }
        }catch(e) {
            console.log(e);
        }
    }
}