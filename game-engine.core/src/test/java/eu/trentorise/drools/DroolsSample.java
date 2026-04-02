/**
 * Copyright 2015 Fondazione Bruno Kessler - Trento RISE
 * <p>
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * <p>
 * http://www.apache.org/licenses/LICENSE-2.0
 * <p>
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package eu.trentorise.drools;

import org.drools.model.codegen.ExecutableModelProject;
import org.junit.Assert;
import org.junit.Test;
import org.kie.api.KieServices;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.command.Command;
import org.kie.api.command.KieCommands;
import org.kie.api.io.KieResources;
import org.kie.api.runtime.ExecutionResults;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.StatelessKieSession;
import org.kie.api.runtime.rule.QueryResults;
import org.kie.api.runtime.rule.QueryResultsRow;

import java.util.ArrayList;
import java.util.Iterator;
import java.util.List;

public class DroolsSample {

    @Test
    public void main() {
        KieServices kieServices = KieServices.get();

        KieResources res = kieServices.getResources();

        org.kie.api.io.Resource r1 = res
                .newFileSystemResource("src/test/resources/action1/rule1.drl");
        KieFileSystem kfs = kieServices.newKieFileSystem();
        kfs.write(r1);

        kieServices.newKieBuilder(kfs).buildAll(ExecutableModelProject.class);

        KieContainer kieContainer = kieServices.newKieContainer(kieServices
                .getRepository().getDefaultReleaseId());

        StatelessKieSession kSession = kieContainer.newStatelessKieSession();
        SampleModel sample = new SampleModel("yop");
        kSession.execute(sample);
        System.out.println(sample.isValid());
        Assert.assertTrue(sample.isValid());

    }

    @Test
    public void inMemoryRule() {
        String rule = "package eu.trentorise.drools " + "rule \"valid sample\""
                + " when" + " eval(true)" + " then"
                + " insert(new SampleModel('ciao'));" + " end";

        String query = "package eu.trentorise.drools query \"GetOutputObj\" "
                + "$o: SampleModel() " + "end";

        KieServices kieServices = KieServices.get();

        KieResources res = kieServices.getResources();

        org.kie.api.io.Resource r1 = res.newByteArrayResource(rule.getBytes())
                .setTargetPath("/t.drl");
        org.kie.api.io.Resource r2 = res.newByteArrayResource(query.getBytes())
                .setTargetPath("/t1.drl");
        KieFileSystem kfs = kieServices.newKieFileSystem();
        kfs.write(r1);
        kfs.write(r2);

        kieServices.newKieBuilder(kfs).buildAll(ExecutableModelProject.class);

        KieContainer kieContainer = kieServices.newKieContainer(kieServices
                .getRepository().getDefaultReleaseId());

        StatelessKieSession kSession = kieContainer.newStatelessKieSession();
        SampleModel sample = new SampleModel("yop");

        KieCommands commandFactory = KieServices.get().getCommands();
        List<Command> cmds = new ArrayList<Command>();
        cmds.add(commandFactory.newInsert(sample));
        cmds.add(commandFactory.newQuery("query", "GetOutputObj"));
        cmds.add(commandFactory.newFireAllRules());
        ExecutionResults results = kSession.execute(commandFactory
                .newBatchExecution(cmds));
        Iterator<QueryResultsRow> iter = ((QueryResults) results
                .getValue("query")).iterator();
        boolean ok = false;
        // while (iter.hasNext()) {
        // SampleModel sm = (SampleModel) iter.next().get("$o");
        // ok = ok || sm.getHello().equals("ciao");
        // }
        //
        // Assert.assertTrue(ok);
    }

}

