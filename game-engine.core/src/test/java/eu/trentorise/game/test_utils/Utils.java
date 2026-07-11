package eu.trentorise.game.test_utils;

import org.joda.time.LocalDateTime;
import org.kie.api.KieServices;
import org.kie.api.builder.KieBuilder;
import org.kie.api.builder.KieFileSystem;
import org.kie.api.builder.Message;
import org.kie.api.builder.Results;
import org.drools.model.codegen.ExecutableModelProject;
import org.kie.api.command.Command;
import org.kie.api.command.KieCommands;
import org.kie.api.runtime.KieContainer;
import org.kie.api.runtime.StatelessKieSession;

import java.io.FileNotFoundException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

public final class Utils {

	// static class, no needs to instantiate
	private Utils() {
	}

	public static Date date(String isoDate) {
		return LocalDateTime.parse(isoDate).toDate();
	}

	public static void main(String args[]) throws FileNotFoundException {
		System.out.println("simple test drool");
//		KnowledgeBuilder kbuilder = KnowledgeBuilderFactory.newKnowledgeBuilder();
//		kbuilder.add(ResourceFactory.newClassPathResource("rules/testLevel/simple.drl", Utils.class), ResourceType.DRL);
//		if (kbuilder.hasErrors()) {
//			System.err.println(kbuilder.getErrors().toString());
//		}
//		KnowledgeBase kbase = KnowledgeBaseFactory.newKnowledgeBase();
//		kbase.addKnowledgePackages(kbuilder.getKnowledgePackages());
//		StatelessKnowledgeSession ksession = kbase.newStatelessKnowledgeSession();
//		Applicant applicant1 = new Applicant("Mr John Smith", 17);
//		Applicant applicant2 = new Applicant("Mr John Smith", 16);
//		System.out.println("applicant1->" + applicant1.isValid() + " applicant2->" + applicant2.isValid());
//		ksession.execute(Arrays.asList( new Object[] { applicant1,  applicant2 }) );
//		System.out.println("applicant1->" + applicant1.isValid() + " applicant2->" + applicant2.isValid());

		KieServices kieServices = KieServices.get();
		KieFileSystem kfs = kieServices.newKieFileSystem();
		kfs.write(kieServices.getResources().newClassPathResource("rules/testLevel/simple.drl", Utils.class));
		KieBuilder kieBuilder = kieServices.newKieBuilder(kfs).buildAll(ExecutableModelProject.class);
		Results results = kieBuilder.getResults();
		if (results.hasMessages(Message.Level.ERROR)) {
			System.out.println(results.getMessages());
			throw new IllegalStateException("### errors ###");
		}
		KieContainer kieContainer = kieServices.newKieContainer(kieServices.getRepository().getDefaultReleaseId());
		StatelessKieSession kieSession = kieContainer.newStatelessKieSession();
		Applicant applicant1 = new Applicant("Mr John Smith", 17);
		Applicant applicant2 = new Applicant("Mr Khurshid Nawaz", 16);
		Application application = new Application();
		application.setDateApplied(new Date());
		System.out.println("applicant(" + applicant1.getName() + ")->" + applicant1.isValid() + " applicant(" + applicant2.getName() + ")->" + applicant2.isValid() + " application ->" + application.isValid());
        KieCommands commandFactory = KieServices.get().getCommands();
        List<Command> cmds = new ArrayList<Command>();
        cmds.add(commandFactory.newInsertElements(Arrays.asList( new Object[] { applicant1,  applicant2, application })));
		kieSession.execute(commandFactory.newBatchExecution(cmds));
		System.out.println("applicant(" + applicant1.getName() + ")->" + applicant1.isValid() + " applicant(" + applicant2.getName() + ")->" + applicant2.isValid() + " application ->" + application.isValid());
    }
}
