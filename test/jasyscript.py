
@task("Source")
def source():
    session = Session()
    session.addProject(Project("../"))
    session.addProject(Project("."))
    
    # Configure fields
    session.permutateField("es5")
    session.setField("debug", True)

    # Include all game relevant assets
    resolver = Resolver(session.getProjects())
    resolver.addClassName("tests")
    assets = Asset(session, resolver.getIncludedClasses()).exportSource()

    # Store kernel script
    formatting = Formatting("semicolon", "comma")
    includedByKernel = storeKernel("source/script/kernel.js", session, assets=assets, debug=True, formatting=formatting)
    print("KERNEL: %s" % includedByKernel)
    
    # Process every possible permutation
    for permutation in session.getPermutations():

        # Resolving dependencies
        resolver = Resolver(session.getProjects())
        resolver.addClassName("tests")
        resolver.excludeClasses(includedByKernel)
        
        # Writing source loader
        destination = "source/script/test-%s.js" % permutation.getChecksum()
        classes = Sorter(resolver).getSortedClasses()
        storeSourceLoader(destination, classes, session)
        
    session.close()
    


@task("Build")
def build():
    session = Session()
    session.addProject(Project("../"))
    session.addProject(Project("."))

    # Configure permutations
    session.permutateField("es5")
    session.setField("debug", True)

    # Prepare assets
    resolver = Resolver(session.getProjects())
    resolver.addClassName("tests")
    assets = Asset(session, resolver.getIncludedClasses()).exportBuild()

    # Compiler configuration
    optimization = Optimization("variables", "declarations", "blocks")
    formatting = Formatting("semicolon", "comma")

    # Write kernel script
    includedByKernel = storeKernel("build/script/kernel.js", session, assets=assets, debug=True, formatting=formatting)

    # Copy files from source
    for staticFile in ["index.html", "qunit.css"]:
        updateFile("source/%s" % staticFile, "build/%s" % staticFile)

    # Process every possible permutation
    for permutation in session.getPermutations():

        # Resolving dependencies
        resolver = Resolver(session.getProjects(), permutation)
        resolver.addClassName("tests")
        resolver.excludeClasses(includedByKernel)

        # Compressing classes
        classes = Sorter(resolver, permutation).getSortedClasses()
        compressedCode = storeCompressed("build/script/test-%s.js" % permutation.getChecksum(), classes, 
            permutation=permutation, optimization=optimization, formatting=formatting)

    session.close()

    
    
    
@task("Clear Cache")
def clear():
    session = Session()
    session.addProject(Project("../"))
    session.addProject(Project("."))
    session.clearCache()
    session.close()    
