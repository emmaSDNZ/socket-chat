const { io } = require('../server');
const { Usuarios } = require('../class/usuarios')
const { crearMensaje } = require('../utils/utils')

const usuarios = new Usuarios()

io.on('connection', (client) => {

    client.on('entrarChat', (data, callback)=>{
        

        if( !data.nombre || !data.sala ){
            return callback({
                error: true,
                mensaje: 'El nombre/sala es necesario'
            })
        } 

        //conectar a un usuario a la sala
        client.join(data.sala);

        usuarios.agregarPersona(client.id, data.nombre, data.sala)

        client.broadcast.to(data.sala).emit('listaPersona', usuarios.getPersonasPorSala(data.sala))
        callback(usuarios.getPersonasPorSala(data.sala))
    })

    client.on('crearMensaje', (data, callback)=>{

        let personas = usuarios.getPersonas(client.id)

        let mensaje = crearMensaje(personas.nombre, data.mensaje)
        client.broadcast.to(personas.sala).emit('crearMensaje', mensaje);
        callback(mensaje)
    })


    client.on('disconnect',()=>{

       let personaBorrada =  usuarios.borrarPersona(client.id) 
       client.broadcast.to(personaBorrada.sala).emit('crearMensaje', crearMensaje('Administrador', `${ personaBorrada.nombre } salió`));
       
       client.broadcast.to(personaBorrada.sala).emit('listaPersona', usuarios.getPersonasPorSala(personaBorrada.sala))
          
    })

    //mensajes privado
    client.on("mensajePrivado", data =>{

        let persona = usuarios.getPersona( client.id )
        client.broadcast.to(data.para).emit("mensajePrivado", crearMensaje(persona.nombre, data.mensaje))
    })
});