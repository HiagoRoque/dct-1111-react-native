import React, { useState, useEffect } from 'react';
import { SafeAreaView, FlatList, Text, View, StyleSheet, Button, TextInput, Alert } from 'react-native';
import { createTableComments, getCommentsDB, insertCommentsDB, updateCommentDB, deleteCommentDB } from '../db';

export default function Comments({ navigation, route }) {
  const [comments, setComments] = useState([]);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [email, setEmail] = useState('');
  const [editingId, setEditingId] = useState(null);

  const postId = route.params.postId;
  const JsonPlaceholder_API = 'https://jsonplaceholder.typicode.com/comments';

  useEffect(() => {
    createTableComments();
    loadComments();
  }, []);

  // Carrega comentários do banco local e da API
  const loadComments = async () => {
    try {
      getCommentsDB(postId, dbComments => {
        if (Array.isArray(dbComments) && dbComments.length > 0) {
          setComments(dbComments);
        } else {
          fetchCommentsFromAPI();
        }
      });
    } catch (error) {
      console.error('Erro ao carregar os comentários:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comentários.');
    }
  };

  // Carrega comentários da API e os insere no banco local
  const fetchCommentsFromAPI = async () => {
    try {
      const response = await fetch(`${JsonPlaceholder_API}?postId=${postId}`);
      if (!response.ok) throw new Error('Erro ao carregar comentários da API.');
      const data = await response.json();

      if (Array.isArray(data)) {
        insertCommentsDB(data);
        setComments(data);
      } else {
        console.error('Os comentários recebidos da API não estão no formato de array.');
      }
    } catch (error) {
      console.error('Erro ao carregar comentários da API:', error);
      Alert.alert('Erro', 'Não foi possível carregar os comentários da API.');
    }
  };

  // Adiciona um novo comentário
  const addComment = async () => {
    if (name && body && email) {
      const newComment = { id: Date.now(), postId, name, email, body };

      try {
        insertCommentsDB([newComment]); // Salva localmente
        setComments([newComment, ...comments]); // Atualiza o estado local
        clearForm();
        Alert.alert('Sucesso', 'Comentário adicionado com sucesso.');
      } catch (error) {
        console.error('Erro ao adicionar comentário:', error);
        Alert.alert('Erro', 'Não foi possível adicionar o comentário.');
      }
    } else {
      Alert.alert('Erro', 'Preencha todos os campos antes de adicionar um comentário.');
    }
  };

  // Atualiza um comentário existente
  const updateComment = async () => {
    if (name && body && email && editingId) {
      const updatedComment = { id: editingId, postId, name, email, body };

      try {
        updateCommentDB(updatedComment); // Atualiza no banco local
        setComments(comments.map(comment => (comment.id === editingId ? updatedComment : comment))); // Atualiza o estado local
        clearForm();
        Alert.alert('Sucesso', 'Comentário atualizado com sucesso.');
      } catch (error) {
        console.error('Erro ao atualizar comentário:', error);
        Alert.alert('Erro', 'Não foi possível atualizar o comentário.');
      }
    } else {
      Alert.alert('Erro', 'Preencha todos os campos antes de atualizar o comentário.');
    }
  };

  // Deleta um comentário
  const deleteComment = async id => {
    try {
      deleteCommentDB(id); // Remove do banco local
      setComments(comments.filter(comment => comment.id !== id)); // Atualiza o estado local
      Alert.alert('Sucesso', 'Comentário deletado com sucesso.');
    } catch (error) {
      console.error('Erro ao deletar comentário:', error);
      Alert.alert('Erro', 'Não foi possível deletar o comentário.');
    }
  };

  // Preenche o formulário para edição
  const editComment = comment => {
    setName(comment.name);
    setBody(comment.body);
    setEmail(comment.email);
    setEditingId(comment.id);
  };

  const clearForm = () => {
    setName('');
    setBody('');
    setEmail('');
    setEditingId(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.title}>{item.name}</Text>
      <Text>{item.body}</Text>
      <Text style={styles.email}>{item.email}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Editar" onPress={() => editComment(item)} />
        <Button title="Excluir" onPress={() => deleteComment(item.id)} />
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <TextInput style={styles.input} placeholder="Nome" value={name} onChangeText={setName} />
      <TextInput style={styles.input} placeholder="Comentário" value={body} onChangeText={setBody} />
      <TextInput style={styles.input} placeholder="E-mail" value={email} onChangeText={setEmail} />
      <Button title={editingId ? "Atualizar Comentário" : "Adicionar Comentário"} onPress={editingId ? updateComment : addComment} />
      <FlatList data={comments} keyExtractor={item => item.id.toString()} renderItem={renderItem} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, marginTop: 20, paddingHorizontal: 16 },
  item: { backgroundColor: '#f9c2ff', padding: 20, marginVertical: 8, borderRadius: 10 },
  title: { fontSize: 18, fontWeight: 'bold' },
  email: { marginTop: 8, fontStyle: 'italic' },
  input: { height: 40, borderColor: '#000', borderWidth: 1, marginBottom: 12, paddingHorizontal: 10, borderRadius: 5 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
});
