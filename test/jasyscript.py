
@task("Build")
def build():
    session = Session()
    session.addProject(Project("../"))
    session.addProject(Project("."))
    
    resolver = Resolver(session.getProjects())
    resolver.addClassName("jquery")
    resolver.addClassName("qunit")
    resolver.addClassName("tests")
    classes = Sorter(resolver).getSortedClasses()
    print(classes)
    
    storeCompressed("build.js", classes, formatting=Formatting("semicolon", "comma"))
    
    
    
@task("Clear Cache")
def clear():
    session = Session()
    session.addProject(Project("../"))
    session.addProject(Project("."))
    session.clearCache()
    session.close()    
