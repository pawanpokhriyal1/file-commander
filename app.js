
const fs = require("fs/promises");
const { promises: fsPromises, watch } = require("fs");
const CREATE_FILE = "create a file";
const DELETE_FILE = "delete a file";
const RENAME_FILE = "rename the file";
const ADD_TO_FILE = "add the file";



(async () => {
    const commandFileHandler = await fs.open("./command.txt", "r");//open the file
    const createFile = async (path) => {

        // console.log(path)
        // fs.writeFile(path, "", (error) => {
        //     if (error) throw error;
        //     console.log("file created")
        // })

        let existingFilehandle;
        try {
            // we want to check whether or not we aleady have that file
            existingFilehandle = await fs.open(path, "r");
            // we already have that file ....
            existingFilehandle.close();
            return console.log(`file path: ${path} already exist !`);

        } catch (error) {
            // we dont have the file now we should create it.
            const newFileHandle = await fs.open(path, "w");
            console.log("A new file is successfully created.");
            newFileHandle.close();
        }

    }

    // const createFile = async (path) => {
    //     try {
    //         // Ensure parent directories exist
    //         await fsPromises.mkdir("/dir", { recursive: true });

    //         // Attempt to open the file for writing (create if not exists)
    //         await fsPromises.open(path, 'wx');
    //         console.log(`A new file is successfully created at: ${path}`);
    //     } catch (error) {
    //         // Handle errors, including the case where the file already exists
    //         if (error.code === 'EEXIST') {
    //             console.log(`File path: ${path} already exists!`);
    //         } else {
    //             console.error(`Error creating file: ${error.message}`);
    //         }
    //     }
    // };


    const deleteFile = async (path) => {
        try {
            await fs.unlink(path);
            console.log(`file ${path} is deleted sucessfully`);
        } catch (error) {
            //file doesn't exist...
            if (error.code === "ENOENT") {
                return console.log(`file path: ${path} not exist !,or destination doesnt exist!`);
            }
            console.log(error);

        }

    }

    const renameFile = async (oldPath, newPath) => {
        try {
            await fs.rename(oldPath, newPath)
            console.log(`file ${oldPath} is renamed to ${newPath}`);

        }
        catch (error) {
            //file doesn't exist...
            if (error.code === "ENOENT") {
                return console.log(`file path: ${oldPath} not exist !,or destination doesnt exist!`);
            }
            console.log(error);
        }
    }

    const addFile = async (path, content) => {
        try {
            let existingFilehandle = await fs.open(path, "r");
            fs.appendFile(path, content);
            existingFilehandle.close();
        } catch (error) {
            //file doesn't exist...
            return console.log(`file path: ${path} not exist !`);
        }
    }

    commandFileHandler.on("change", async () => {
        // get file size we need to allocate
        const size = (await commandFileHandler.stat())?.size;
        // allocate our buffer  with the size of the file 
        const buff = Buffer.alloc(size);
        // the location at which we want to start filling our buffer
        const offset = 0;
        // how many bytes we want to read
        const length = buff.byteLength;
        // the position  that we want to start reading the file from 
        const position = 0;

        //we always want to read the whole content (from beginning all the way to the end)
        await commandFileHandler.read(buff, offset, length, position);
        //file was changed
        console.log("The file was changed ");
        // console.log(buff.toString("utf-8"));
        const command = buff.toString("utf-8");

        //create a file :
        // create a file <path>
        if (command.includes(CREATE_FILE)) {
            const filePath = command.substring(CREATE_FILE.length + 1);
            console.log("path", filePath);
            createFile(filePath);

        }

        //delete a file :
        // delete a file <path>
        if (command.includes(DELETE_FILE)) {
            const filePath = command.substring(DELETE_FILE.length + 1);
            console.log("deleted file path ::::", filePath);
            deleteFile(filePath);

        }

        //rename a file :
        // rename the file <oldpath> to <newpath>
        if (command.includes(RENAME_FILE)) {
            const idx = command.indexOf(" to ");
            const oldFilePath = command.substring(RENAME_FILE.length + 1, idx);
            const newFilePath = command.substring(idx + 4);

            console.log("old file path ::::", oldFilePath);
            console.log("new file path ::::", newFilePath);

            renameFile(oldFilePath, newFilePath);

        }

        //add content to a file :
        // add the file <path> with content: <content>
        if (command.includes(ADD_TO_FILE)) {
            const idx = command.indexOf(" with content: ");
            const filePath = command.substring(ADD_TO_FILE.length + 1, idx);
            const content = command.substring(idx + 15);
            console.log("file path ::::", filePath);
            console.log("content ::::", content);

            addFile(filePath, content);

        }

    })


    //watcher....
    const watcher = fs.watch("./command.txt");

    for await (const event of watcher) {
        if (event.eventType === "change") {
            commandFileHandler.emit("change");


        }
    }
})();


/** CallBack Api alternative method */
// import { watch } from 'node:fs';
// watch('somedir', (eventType, filename) => {
//     console.log(`event type is: ${eventType}`);
//     if (filename) {
//         console.log(`filename provided: ${filename}`);
//     } else {
//         console.log('filename not provided');
//     }
// });

// import { watchFile } from 'node:fs';

// watchFile('message.text', (curr, prev) => {
//     console.log(`the current mtime is: ${curr.mtime}`);
//     console.log(`the previous mtime was: ${prev.mtime}`);
// }); 